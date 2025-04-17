const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3000;

let metodo_entrada = 'VOZ'; // GESTOS o VOZ

// Middleware para servir archivos estáticos
app.use(express.static("../../frontend"));
app.use(express.json());

// Ruta RESTful de ejemplo
app.post("/api/send-data", (req, res) => {
  const data = req.body;
  console.log("Datos recibidos por REST:", data);
  io.emit("data-from-rest", data);
  res.status(200).send({ status: "ok" });
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
    };; // Confirmar tipo al cliente
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

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log("Servidor escuchando en http://localhost:3000");
});
