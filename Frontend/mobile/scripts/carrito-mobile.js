

document.addEventListener('DOMContentLoaded', () => {

  const socket = io();

// Identificar dispositivo como "web"
socket.emit("identificar", "mobile");

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
        <p><strong>Unidades en stock:</strong> ${producto.unidades_en_stock}</p>
      `;

      container.appendChild(productoDiv);
    });
  }
});

// Emitir evento para vaciar el carrito
document.getElementById("vaciar-carrito").addEventListener("click", () => {
  socket.emit("carrito-vaciar");
});
});