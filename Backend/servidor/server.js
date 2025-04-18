const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 4000;
const bodyParser = require("body-parser");
const fs = require("fs");
const { parse } = require("path");

let metodo_entrada = 'VOZ'; // GESTOS o VOZ
// cargar datos de la base de datos
const productosPath = "./data/almacen.json";

//lista de los productos
let productos = [];
let carritoCompartido = [];

// Middleware para servir archivos estáticos
app.use(express.static("../servidor"));
app.use(bodyParser.json());
app.use(express.static("../../frontend"));
app.use(express.json());

function loadProductos(res) {
  try {
    const data = fs.readFileSync(productosPath, "utf8");
    productos = JSON.parse(data).almacen;
  } catch (err) {
    console.error("Error a cargar la lista de productos:", err);
    if (res) {
      return res.status(500).send({error:"Error al cargar la lista de productos"});
    }
  }
}

function saveProductos(res) {
  try {
    fs.writeFileSync(productosPath, JSON.stringify(productos, null, 2));
  } catch (err) {
    console.error("Error al guardar la lista de productos:", err);
    if (res) {
      return res.status(500).send({error:"Error al guardar la lista de productos"});
    }
  }
}

app.get("/productos", (req, res) => {
  if (productos.length === 0) {
     return res.status(404).send({error:"No hay productos cargados"});
  }
  res.status(200).send(productos);
});

app.get('/productos/:id', (req, res) => {
  const producto = productos.find(t => t.id === req.params.id);
  if (!producto) {
      return res.status(404).send({ error: 'Producto no encontrado.' });
  }
  res.status(200).send(producto);
});

app.post('/productos', (req, res) => {
  const newProducto = req.body;

  // Verificar que todos los atributos necesarios están presentes
  if (!newProducto.id || !newProducto.nombre 
    || !newProducto.descripcion || !newProducto.color || !newProducto.precio
    || !newProducto.unidades_en_stock || !newProducto.localizacion_en_almacen) {
      return res.status(400).send({ error: 'Faltan atributos requeridos en el producto.' });
  }

  // Verificar que no existan atributos no permitidos
  const allowedKeys = ['id', 'nombre', 'descripcion', 'color', 'precio', 'unidades_en_stock', 'localizacion_en_almacen'];
  const invalidKeys = Object.keys(newProducto).filter(key => !allowedKeys.includes(key));
  if (invalidKeys.length > 0) {
      return res.status(400).send({ error: `Atributos no permitidos: ${invalidKeys.join(', ')}` });
  }

  // Verificar que el id no exista ya
  const idExists = productos.some(producto => producto.id === newProducto.id);
  if (idExists) {
      return res.status(409).send({ error: 'El id del producto ya existe.' });
  }

  productos.push(newProducto);
  saveProductos(res);
  res.status(201).send(newProducto);
});


app.delete("/productos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = productos.findIndex(producto => producto.id === id);
  if (index < 0) {
    return res.status(404).send({ error: 'Producto no encontrado' });
  }
  productos.splice(index, 1);
  saveProductos(res);
  res.status(204).send();
});


// WebSocket Socket.IO
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  let tipoDispositivo = null; // Variable para almacenar el tipo de dispositivo

  // Solicitar tipo de dispositivo
  socket.on("identificar", (tipo) => {
    tipoDispositivo = tipo; // Guardar el tipo de dispositivo
    console.log(`Dispositivo identificado: ${socket.id} como ${tipo}`);
    socket.emit("tipo-confirmado", tipo)
    
    if (tipoDispositivo === "mobile") { // Verificar si el tipo es 'web'
      socket.emit("entrada-server", metodo_entrada); // Enviar estado inicial al cliente web
      // Enviar el carrito actual al dispositivo conectado
      // Enviar el carrito actual al dispositivo conectado
    };
    socket.emit("carrito-actualizado", carritoCompartido);
  });

  socket.on("entrada", (data) => {
    if (tipoDispositivo === "web") { // Verificar si el tipo es 'web'
      metodo_entrada = data;
      console.log("Datos recibidos:", metodo_entrada);
      socket.broadcast.emit("entrada-server", metodo_entrada);
    }
  });

  socket.on("cambio-pagina", (pagina) => {
    if (tipoDispositivo === "mobile") { // Verificar si el tipo es 'mobile'
      console.log("Cambio de página solicitado:", pagina);
      socket.broadcast.emit("cambio-pagina-server", pagina);
    }
  });

  // Escuchar cuando un dispositivo añade un producto al carrito
  socket.on("carrito-agregar", (producto) => {
    carritoCompartido.push(producto);
    console.log("Producto añadido al carrito:", producto);

    // Notificar a todos los dispositivos conectados
    io.emit("carrito-actualizado", carritoCompartido);
  });

  // Escuchar cuando un dispositivo vacía el carrito
  socket.on("carrito-vaciar", () => {
    carritoCompartido = [];
    console.log("Carrito vaciado");

    // Notificar a todos los dispositivos conectados
    io.emit("carrito-actualizado", carritoCompartido);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

loadProductos();

server.listen(PORT, () => {
  console.log("Servidor escuchando en http://localhost:" + PORT);
});
