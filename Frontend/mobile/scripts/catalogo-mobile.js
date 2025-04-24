import { activarDeteccionMovimiento } from './gestos.js';

document.addEventListener("DOMContentLoaded", () => {

const socket = io();
const botonatras = document.getElementById("boton-atras");
const modeLabel = document.getElementById('modeLabel');


socket.emit("identificar", "mobile");
socket.on("tipo-confirmado", (tipo) => {
  console.log("Tipo de dispositivo confirmado:", tipo);
});

botonatras.addEventListener("click", () => {
    window.location.href = 'index.html'; // Redirigir a la página de inicio
    socket.emit('cambio-pagina', 'index.html'); // Enviar evento al servidor
  });

  socket.on("cambio-pagina-server", (pagina) => {
    window.location.href = pagina;});

socket.emit("solicitar-estado"); 
socket.on("entrada-server", (data) => {
  modeLabel.textContent = data;  });

// Verificar si el dispositivo soporta DeviceMotionEvent
if (typeof DeviceMotionEvent !== 'undefined') {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
          .then(permissionState => {
              if ((permissionState === 'granted') && (modeLabel.textContent === 'GESTOS')) {
                  activarDeteccionMovimiento(socket);
                  console.log('DANZA KUDUROOOOOOOOOOOOOOOOOOOOOOOOOO');
              } else {
                  console.log('Permiso para DeviceMotionEvent denegado.');
              }
          })
          .catch(console.error);
  } else {
      activarDeteccionMovimiento(socket);
  }
} else {
  console.log('DeviceMotionEvent no está soportado.');
}

});
