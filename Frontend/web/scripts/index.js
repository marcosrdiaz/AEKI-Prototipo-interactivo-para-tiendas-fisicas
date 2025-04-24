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
      const accion = botones[index].textContent.toLowerCase() + ".html";
      window.location.href = accion;
      let accionmobile = botones[index].textContent.toLowerCase() + "-mobile.html";
      console.log("Navegando a:", accionmobile);
      socket.emit("cambio-pagina", accionmobile); // Enviar evento al servidor

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

    socket.on("gesto-navegacion-server", (direccion) => {
      console.log("Gesto de navegación recibido:", direccion);
      if (direccion === "derecha") {
        seleccionado = (seleccionado + 1) % botones.length;
      } else if (direccion === "izquierda") {
        seleccionado = (seleccionado - 1 + botones.length) % botones.length;
      } else if (direccion === "arriba") {
        activarBoton(seleccionado);
      } else if (direccion === "agitar") {
        modeLabel.textContent = 'VOZ';
        modeSwitch.checked = true;
        enviarEstado();
      }

      resaltarBoton(seleccionado);
      

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
      socket.emit("cambio-pagina", "mapa-mobile.html"); // Enviar evento al servidor
    });

    document.getElementById("btnCarrito").addEventListener("click", () => {
      window.location.href = "carrito.html";
      socket.emit("cambio-pagina", "carrito-mobile.html"); // Enviar evento al servidor
      
    });

    document.getElementById("btnNFC").addEventListener("click", () => {
      window.location.href = "nfc.html";
      socket.emit("cambio-pagina", "nfc-mobile.html"); // Enviar evento al servidor
    });

    document.getElementById("btnCatalogo").addEventListener("click", () => {
      window.location.href = "catalogo.html";
      socket.emit("cambio-pagina", "catalogo-mobile.html"); // Enviar evento al servidor
    });

  socket.on ("cambio-pagina-server", (pagina) => {
    console.log("cambio de pagina", pagina)
    window.location.href = pagina;
  });
});




