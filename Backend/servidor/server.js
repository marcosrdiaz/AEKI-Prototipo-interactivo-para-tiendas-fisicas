const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3000

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
  console.log("Cliente conectado via socket:", socket.id);

  socket.on("status", (data) => {
    console.log("Datos recibidos:", data);
    const status = { modo: data.modo };
    // data.modo estará disponible
    socket.broadcast.emit("status-server", data);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

// En el servidor
socket.on("request-status", () => {
  const estadoActual = status // Ejemplo de estado actual
  socket.emit("status-server", estadoActual);
});


server.listen(PORT, () => {
  console.log("Servidor escuchando en http://localhost:3000");
});
