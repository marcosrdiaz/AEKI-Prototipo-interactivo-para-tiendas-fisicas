document.addEventListener("DOMContentLoaded", () => {

const socket = io();
 
// Identificar dispositivo como "web"
socket.emit("identificar", "web");

socket.on("tipo-confirmado", (tipo) => {
    console.log("Tipo de dispositivo confirmado:", tipo);
});

socket.on("entrada-server", (data) => {
  console.log("Estado web actualizado", data)
  modeLabel.textContent = data;
  if (data === 'VOZ') {modeSwitch.checked = true;}
  else modeSwitch.checked = false;
    
});



const botones = document.querySelectorAll('.button');
    let seleccionado = 0;

    function resaltarBoton(index) {
      botones.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
      });
    }

    function activarBoton(index) {
      const accion = botones[index].textContent;
      alert(`Acción: ${accion}`);
    }

    // Navegación simulada con flechas izquierda/derecha y Enter
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        seleccionado = (seleccionado + 1) % botones.length;
        resaltarBoton(seleccionado);
      } else if (e.key === 'ArrowLeft') {
        seleccionado = (seleccionado - 1 + botones.length) % botones.length;
        resaltarBoton(seleccionado);
      } else if (e.key === 'Enter') {
        activarBoton(seleccionado);
      }
    });

    // Inicial
    resaltarBoton(seleccionado);

    const modeSwitch = document.getElementById('modeSwitch');
    const modeLabel = document.getElementById('modeLabel');

    function enviarEstado() {
      const entrada = modeLabel.textContent;
      console.log("Enviando:", entrada);
      socket.emit("entrada",  entrada);  // envía { modo: 'VOZ' } o { modo: 'GESTOS' }
      console.log("Modo de entrada actualizado:", entrada);
    }

  
    modeSwitch.addEventListener('change', () => {
      if (modeSwitch.checked) {
        modeLabel.textContent = 'VOZ';
        enviarEstado();
        console.log('Modo cambiado a VOZ')
        // Implementar lógica para modo VOZ
      } else {
        modeLabel.textContent = 'GESTOS';
        enviarEstado();
        console.log('Modo cambiado a GESTOS');
        // Implementar lógica para modo GESTOS
      }
    });

    document.getElementById("btnMapa").addEventListener("click", () => {
      window.location.href = "mapa.html";
    });

    document.getElementById("btnCarrito").addEventListener("click", () => {
      window.location.href = "carrito.html";
    });

    document.getElementById("btnComprar").addEventListener("click", () => {
      window.location.href = "carrito.html";
    });

    document.getElementById("btnCatalogo").addEventListener("click", () => {
      window.location.href = "catalogo.html";
    });

  socket.on ("cambio-pagina-server", (pagina) => {
    console.log("cambio de pagina", pagina)
    window.location.href = pagina;
  });
});




