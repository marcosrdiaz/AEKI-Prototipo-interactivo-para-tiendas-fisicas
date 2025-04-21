document.addEventListener("DOMContentLoaded", () => {
  const socket = io();
  const botonatras = document.getElementById("boton-atras");
  // Identificar dispositivo como "web"
  socket.emit("identificar", "web");

  socket.on("tipo-confirmado", (tipo) => {
    console.log("Tipo de dispositivo confirmado:", tipo);
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
          <h2>${producto.nombre}</h2>
          <p><strong>Descripción:</strong> ${producto.descripcion}</p>
          <p><strong>Color:</strong> ${producto.color}</p>
          <p><strong>Precio:</strong> $${producto.precio.toFixed(2)}</p>
          <button class="eliminar-producto" data-id="${producto.id}">Eliminar</button>
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

  botonatras.addEventListener("click", () => {
    window.location.href = 'index.html'; // Redirigir a la página de inicio
    socket.emit('cambio-pagina', 'index.html'); // Enviar evento al servidor
  });

  // Emitir evento para vaciar el carrito
  document.getElementById("vaciar-carrito").addEventListener("click", () => {
    socket.emit("carrito-vaciar");
    
  });
});
   


