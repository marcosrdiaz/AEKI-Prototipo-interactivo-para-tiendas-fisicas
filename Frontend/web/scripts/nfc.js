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

socket.on("gesto-navegacion-server", (direccion) => {
  if (direccion === "izquierda") {
        window.location.href = 'index.html'; // Redirigir a la página de inicio
        socket.emit('cambio-pagina', 'index.html'); // Enviar evento al servidor
        
    }
});

socket.on("producto-nfc", (producto) => {
  console.log("Producto NFC recibido:", producto);
  if (producto) {
    // Crear el popup con la información del producto
    const popup = document.createElement("div");
    popup.className = "popup";

    popup.innerHTML = `
      <div class="popup-content">
        <img src="${producto.imagen}" alt="${producto.nombre}" class="popup-img">
        <h2>${producto.nombre}</h2>
        <p><strong>Descripción:</strong> ${producto.descripcion}</p>
        <p><strong>Color:</strong> ${producto.color}</p>
        <p><strong>Precio:</strong> $${producto.precio.toFixed(2)}</p>
      </div>
    `;

    document.body.appendChild(popup);

  }
});