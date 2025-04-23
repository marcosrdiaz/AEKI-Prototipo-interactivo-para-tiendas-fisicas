document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  // Identificar dispositivo como "web"
  socket.emit("identificar", "web");
  const botonatras = document.getElementById("boton-atras");

  socket.on("tipo-confirmado", (tipo) => {
    console.log("Tipo de dispositivo confirmado:", tipo);
  });

  socket.emit("solicitar-estado"); 
  socket.on("entrada-server", (data) => {
    modeLabel.textContent = data;  });

  botonatras.addEventListener("click", () => {
    window.location.href = 'index.html'; // Redirigir a la página de inicio
    socket.emit('cambio-pagina', 'index.html'); // Enviar evento al servidor
  });

  // Cargar productos del carrito desde el servidor
  socket.on("carrito-actualizado", (carrito) => {
    const container = document.getElementById("carrito-container");
    container.innerHTML = ""; // Limpiar el contenido inicial

    if (carrito.length === 0) {
      container.innerHTML = "<p>El carrito está vacío.</p>";
    } else {
      carrito.forEach((producto) => {
        const productoDiv = document.createElement("div");
        productoDiv.className = "producto";

        productoDiv.innerHTML = `
          <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen" />
          <div class="producto-contenido">
            <h2>${producto.nombre}</h2>
            <p><strong>Descripción:</strong> ${producto.descripcion}</p>
            <p><strong>Color:</strong> ${producto.color}</p>
            <p><strong>Precio:</strong> $${producto.precio.toFixed(2)}</p>
            <p><strong>Cantidad:</strong> ${producto.cantidad}</p>
            <button class="eliminar-producto" data-id="${producto.id}">Eliminar</button>
          </div>
        `;

        container.appendChild(productoDiv);
      });

      // Asignar eventos a los botones "Eliminar"
      document.querySelectorAll(".eliminar-producto").forEach((button) => {
        button.addEventListener("click", (event) => {
          const productoId = event.target.getAttribute("data-id");
          socket.emit("eliminar-producto", productoId);
        });
      });
    }
  });

  socket.on("cambio-pagina-server", (pagina) => {
    console.log("Cambio de página", pagina);
    window.location.href = pagina;
  });

  socket.on("gesto-navegacion-server", (direccion) => {
    if (direccion === "agitar") {
          console.log("Gesto agitar");
          socket.emit("carrito-vaciar");
          
      }});

  // Emitir evento para vaciar el carrito
  document.getElementById("vaciar-carrito").addEventListener("click", () => {
    socket.emit("carrito-vaciar");
  });
});
  


