
document.addEventListener("DOMContentLoaded", () => {

const socket = io();
const botonatras = document.getElementById("boton-atras");

botonatras.addEventListener("click", () => {
    window.location.href = 'index.html'; // Redirigir a la página de inicio
    socket.emit('cambio-pagina', 'index.html'); // Enviar evento al servidor
  });

  socket.on("cambio-pagina-server", (pagina) => {
    window.location.href = pagina;});


// Verificar si el dispositivo soporta DeviceMotionEvent
if (typeof DeviceMotionEvent !== 'undefined') {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
          .then(permissionState => {
              if ((permissionState === 'granted') && (modeLabel.textContent === 'GESTOS')) {
                  activarDeteccionMovimiento();
                  console.log('DANZA KUDUROOOOOOOOOOOOOOOOOOOOOOOOOO');
              } else {
                  console.log('Permiso para DeviceMotionEvent denegado.');
              }
          })
          .catch(console.error);
  } else {
      activarDeteccionMovimiento();
  }
} else {
  console.log('DeviceMotionEvent no está soportado.');
}

function activarDeteccionMovimiento() {
  let puedeDetectar = true; // Controlar el tiempo de espera entre detecciones

  window.addEventListener('devicemotion', (event) => {
      if (!puedeDetectar) return;

      const umbral = 15; // Umbral para detectar movimientos bruscos
      const { x, y, z } = event.acceleration;

      // Detectar si es un gesto de agitar
      if (Math.abs(x) > umbral && Math.abs(y) > umbral && Math.abs(z) > umbral) {
          console.log('Gesto de agitar detectado');
          socket.emit("gesto-navegacion", 'agitar');
      } else if (x > umbral) {
          console.log('Movimiento brusco X POSITIVA');
          socket.emit("gesto-navegacion", 'derecha');
      } else if (x < -umbral) {
          console.log('Movimiento brusco X NEGATIVA');
          socket.emit("gesto-navegacion", 'izquierda');
      } else if (z > umbral) {
          console.log('Movimiento brusco Z POSITIVA');
          socket.emit("gesto-navegacion", 'arriba');
      }else {
          return; // No se detectó movimiento brusco
      }

      // Desactivar detección temporalmente
      puedeDetectar = false;
      setTimeout(() => {
          puedeDetectar = true; // Reactivar detección después de 1 segundo
      }, 1000);
  });
}
});
