document.addEventListener("DOMContentLoaded", () => {

const socket = io();
const botonatras = document.getElementById("boton-atras");
let productos = []; // Array para almacenar los productos
let seleccionado = 0; // Variable para el índice del producto seleccionado

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
        <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen" />
        <div class="producto-contenido">
          <h2>${producto.nombre}</h2>
          <p><strong>Descripción:</strong> ${producto.descripcion}</p>
          <p><strong>Color:</strong> ${producto.color}</p>
          <p><strong>Precio:</strong> $${producto.precio.toFixed(2)}</p>
          <button class="add-to-cart" data-id="${producto.id}">Añadir al carrito</button>
        </div>
`;

      container.appendChild(productoDiv);

      // Añadir evento al botón
      productoDiv.querySelector(".add-to-cart").addEventListener("click", () => {
        socket.emit("carrito-agregar", producto);
        alert(`Producto "${producto.nombre}" añadido al carrito.`);
      });

      resaltarProducto(seleccionado);

    });
  })
  .catch((error) => {
    const container = document.getElementById("productos-container");
    container.innerHTML = `<p>Error: ${error.message}</p>`;
  });

  // Función para resaltar un producto
  function resaltarProducto(index) {
    const productosDiv = document.querySelectorAll(".producto");
    productosDiv.forEach((producto, i) => {
        producto.classList.toggle("resaltado", i === index);
    });
}

// Función para mostrar ventana emergente de confirmación
function mostrarConfirmacion(producto) {
    const confirmacion = document.createElement("div");
    confirmacion.className = "confirmacion";
    confirmacion.innerHTML = `
        <p>¿Añadir "${producto.nombre}" al carrito?</p>
        <p>Mueve el móvil a la derecha para SÍ o a la izquierda para NO.</p>
    `;
    document.body.appendChild(confirmacion);

    // Escuchar gestos para confirmar o cancelar
    socket.on("gesto-navegacion-server", (direccion) => {
        if (direccion === "derecha") {
            socket.emit("carrito-agregar", producto);
            alert(`Producto "${producto.nombre}" añadido al carrito.`);
            document.body.removeChild(confirmacion);
        } else if (direccion === "izquierda") {
            alert("Acción cancelada.");
            document.body.removeChild(confirmacion);
        }
    });
}

// Escuchar gestos de navegación

socket.on("gesto-navegacion-server", (direccion) => {
    if (direccion === "abajo") {
        seleccionado = (seleccionado + 1) % productos.length;
        resaltarProducto(seleccionado);
    } else if (direccion === "arriba") {
        seleccionado = (seleccionado - 1 + productos.length) % productos.length;
        resaltarProducto(seleccionado);
    } else if (direccion === "agitar") {
        mostrarConfirmacion(productos[seleccionado]);
    }
});

  socket.on ("cambio-pagina-server", (pagina) => {
    console.log("cambio de pagina", pagina)
    window.location.href = pagina;
  });
});
