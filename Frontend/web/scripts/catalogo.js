document.addEventListener("DOMContentLoaded", () => {

const socket = io();
const botonatras = document.getElementById("boton-atras");

// Identificar dispositivo como "web"
socket.emit("identificar", "web");

socket.on("tipo-confirmado", (tipo) => {
    console.log("Tipo de dispositivo confirmado:", tipo);
});

botonatras.addEventListener("click", () => {
  window.location.href = 'index.html'; // Redirigir a la página de inicio
  socket.emit('cambio-pagina', 'index.html'); // Enviar evento al servidor
});

// Realizar la petición GET para obtener los productos
fetch("http://localhost:4000/productos")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Error al obtener los productos");
    }
    return response.json();
  })
  .then((data) => {
    const productos = data;
    const container = document.getElementById("productos-container");
    container.innerHTML = ""; // Limpiar el contenido inicial

    if (productos.length === 0) {
      container.innerHTML = "<p>No hay productos disponibles.</p>";
      return;
    }

    // Crear elementos ara cada producto
    productos.forEach((producto) => {
      const productoDiv = document.createElement("div");
      productoDiv.className = "producto";

      productoDiv.innerHTML = `
        <h2>${producto.nombre}</h2>
        <p><strong>Descripción:</strong> ${producto.descripcion}</p>
        <p><strong>Color:</strong> ${producto.color}</p>
        <p><strong>Precio:</strong> $${producto.precio.toFixed(2)}</p>
        <button class="add-to-cart" data-id="${producto.id}">Añadir al carrito</button>
      `;

      container.appendChild(productoDiv);

      // Añadir evento al botón
      productoDiv.querySelector(".add-to-cart").addEventListener("click", () => {
        socket.emit("carrito-agregar", producto);
        alert(`Producto "${producto.nombre}" añadido al carrito.`);
      });
    });
  })
  .catch((error) => {
    const container = document.getElementById("productos-container");
    container.innerHTML = `<p>Error: ${error.message}</p>`;
  });

  socket.on ("cambio-pagina-server", (pagina) => {
    console.log("cambio de pagina", pagina)
    window.location.href = pagina;
  });
});
