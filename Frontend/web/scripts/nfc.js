const socket = io();
const botonatras = document.getElementById("boton-atras");
const modeLabel = document.getElementById('modeLabel');


botonatras.addEventListener("click", () => {
    window.location.href = 'index.html'; // Redirigir a la página de inicio
    socket.emit('cambio-pagina', 'index.html'); // Enviar evento al servidor
  });

socket.emit("identificar", "web");
socket.on("tipo-confirmado", (tipo) => {
  console.log("Tipo de dispositivo confirmado:", tipo);
});

socket.emit("solicitar-estado"); 
socket.on("entrada-server", (data) => {
  modeLabel.textContent = data;  });

  socket.on ("cambio-pagina-server", (pagina) => {
    console.log("cambio de pagina", pagina)
    window.location.href = pagina;
  });