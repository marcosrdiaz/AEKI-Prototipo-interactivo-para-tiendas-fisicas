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
const path = require("path");

let metodo_entrada = 'VOZ'; // GESTOS o VOZ
// cargar datos de la base de datos
const productosPath = "./data/almacen.json";

//lista de los productos
let productos = [];
let carritoCompartido = [];



// Middleware para servir archivos estáticos
app.use(express.static("../servidor"));
app.use(express.static(path.join(__dirname, 'public')));
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

// Ruta para obtener los datos del almacén
app.get('/api/almacen', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'almacen.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo almacen.json:', err);
      return res.status(500).json({ error: 'Error al leer los datos del almacén' });
    }
    res.json(JSON.parse(data));
  });
});

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


// WebSocket Socket.IO
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Solicitar tipo de dispositivo
  socket.on("identificar", (tipo) => {
    tipoDispositivo = tipo; // Guardar el tipo de dispositivo
    console.log(`Dispositivo identificado: ${socket.id} como ${tipo}`);
    socket.emit("tipo-confirmado", tipo)
    socket.emit("entrada-server", metodo_entrada); // Enviar estado inicial al cliente web
      // Enviar el carrito actual al dispositivo conectado
      // Enviar el carrito actual al dispositivo conectado
    socket.emit("carrito-actualizado", carritoCompartido);
  });

  socket.on("solicitar-estado", () => {
    socket.emit("entrada-server", metodo_entrada);}); // Enviar estado inicial al cliente web)

  socket.on("entrada", (data) => {
    metodo_entrada = data;
    console.log("Datos recibidos:", metodo_entrada);
    socket.broadcast.emit("entrada-server", metodo_entrada);
    });

  socket.on("cambio-pagina", (pagina) => {
    console.log("Cambio de página solicitado:", pagina);
    socket.broadcast.emit("cambio-pagina-server", pagina);
    }
  );

  // Escuchar cuando un dispositivo añade un producto al carrito
  socket.on("carrito-agregar", (producto) => {
    // Buscar si el producto ya existe en el carritoCompartido por su id
  const index = carritoCompartido.findIndex(p => p.id === producto.id);
  if (index !== -1) {
    // Si existe, incrementar la cantidad (si no existe, se asume 1)
    carritoCompartido[index].cantidad = (carritoCompartido[index].cantidad || 1) + 1;
  } else {
    // Si no existe, establecer la cantidad en 1 y agregar el producto
    producto.cantidad = 1;
    carritoCompartido.push(producto);
  }

  console.log("Producto agregado al carrito:", producto);
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

  // Escuchar cuando un dispositivo elimina un producto específico del carrito
  socket.on("eliminar-producto", (productoId) => {
    carritoCompartido = carritoCompartido.filter(
      (producto) => producto.id !== productoId
    );
    console.log(`Producto con ID ${productoId} eliminado del carrito`);

    // Notificar a todos los dispositivos conectados
    io.emit("carrito-actualizado", carritoCompartido);
  });

  socket.on("gesto-navegacion", (direccion) => {
    console.log("Gesto de navegación recibido:", direccion);
    socket.broadcast.emit("gesto-navegacion-server", direccion);
  });

   // En el servidor
   socket.on("mostrar-ruta", ({ nombre, destino }) => {
    socket.broadcast.emit("mostrar-ruta", { nombre, destino });
  });

  socket.on("producto-nfc", (producto) => {
    console.log("Producto NFC recibido:", producto);
    socket.broadcast.emit("producto-nfc", producto);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });

   

});

loadProductos();

server.listen(PORT, () => {
  console.log("Servidor escuchando en http://localhost:" + PORT);
});
