const cors = require('cors');
const express = require('express');
const fs = require('fs');
const app = express();

app.use(cors());
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(express.static('mobile/scripts'));

const ProductosPath = './resources/carrito.json'
const PORT = 3050;
let Productos = [];

function loadProductos(res) {
    try {
        const data = fs.readFileSync(ProductosPath, 'utf8');
        Productos = JSON.parse(data);
    } catch (err) {
        console.error('Error al cargar la lista de Productos:', err);
        if (res) {
            return res.status(500).send({ error: 'Error al cargar la lista de Productos.' });
        }
    }
}

function saveProductos(res) {
    try {
        fs.writeFileSync(ProductosPath, JSON.stringify(Productos, null, 2));
    } catch (err) {
        console.error('Error al guardar la lista de Productos:', err);
        if (res) {
            return res.status(500).send({ error: 'Error al guardar la lista de Productos.' });
        }
    }
}

app.get('/Productos', (req, res) => {
    if (Productos.length === 0) {
        return res.status(404).send({ error: 'No se encontraron Productos.' });
    }
    res.status(200).send(Productos);
});

app.get('/Productos/:id', (req, res) => {
    const tarea = Productos.find(t => t.id === parseInt(req.params.id));
    if (!tarea) {
        return res.status(404).send({ error: 'Tarea no encontrada.' });
    }
    res.status(200).send(tarea);
});

app.post('/Productos', (req, res) => {
    const newTarea = req.body;

    // Verificar que todos los atributos necesarios están presentes
    if (!newTarea.id || !newTarea.nombre || !newTarea.descripcion) {
        return res.status(400).send({ error: 'Faltan atributos requeridos en la tarea.' });
    }

    // Verificar que no existan atributos no permitidos
    const allowedKeys = ['id', 'nombre', 'descripcion'];
    const invalidKeys = Object.keys(newTarea).filter(key => !allowedKeys.includes(key));
    if (invalidKeys.length > 0) {
        return res.status(400).send({ error: `Atributos no permitidos: ${invalidKeys.join(', ')}` });
    }

    // Verificar que el id no exista ya
    const idExists = Productos.some(tarea => tarea.id === newTarea.id);
    if (idExists) {
        return res.status(409).send({ error: 'El id de la tarea ya existe.' });
    }

    Productos.push(newTarea);
    saveProductos(res);
    res.status(201).send(newTarea);
});

app.put('/Productos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const updatedParameters = req.body;

    const index = Productos.findIndex((tarea) => tarea.id === id);
    if (index < 0) {
        return res.status(404).send({ error: 'Tarea no encontrada.' });
    }

    // Verificar que no existan atributos no permitidos
    const allowedKeys = ['id', 'nombre', 'descripcion'];
    const invalidKeys = Object.keys(updatedParameters).filter(key => !allowedKeys.includes(key));
    if (invalidKeys.length > 0) {
        return res.status(400).send({ error: `Atributos no permitidos: ${invalidKeys.join(', ')}` });
    }

    // Actualizar solo los atributos proporcionados
    Productos[index] = { ...Productos[index], ...updatedParameters };
    saveProductos(res);
    res.status(200).send(Productos[index]);
});

app.delete('/Productos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = Productos.findIndex((tarea) => tarea.id === id);
    if (index < 0) {
        return res.status(404).send({ error: 'Tarea no encontrada.' });
    }

    Productos.splice(index, 1);
    saveProductos(res);
    res.sendStatus(204);
});

// Cargar contactos al iniciar el servidor
loadProductos();

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});