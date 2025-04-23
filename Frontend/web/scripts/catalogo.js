document.addEventListener("DOMContentLoaded", () => {

const socket = io();
const botonatras = document.getElementById("boton-atras");
let productosLista = []; // Array para almacenar los productos
let seleccionado = 0; // Variable para el índice del producto seleccionado
let gestosNav = true; // Variable para saber si se debe ejecutar el gesto de navegación

// Identificar dispositivo como "web"
socket.emit("identificar", "web");

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

 // Listener para el elemento de instrucciones
 const instrucciones = document.getElementById("instrucciones");
 instrucciones.addEventListener("click", () => {
   mostrarGestosDisponibles();
 });

 // Función para mostrar modal de gestos disponibles
 function mostrarGestosDisponibles() {
   const overlay = document.createElement("div");
   overlay.className = "modal-gestos-overlay";

   const modal = document.createElement("div");
   modal.className = "modal-gestos";
   modal.innerHTML = `
     <h3>Gestos disponibles</h3>
     <ul>
       <li><strong>Arriba:</strong> Seleccionar producto anterior</li>
       <li><strong>Abajo:</strong> Seleccionar siguiente producto</li>
       <li><strong>Derecha:</strong> Confirmar acción (añadir producto)</li>
       <li><strong>Izquierda:</strong> Cancelar acción</li>
       <li><strong>Agitar:</strong> Activar confirmación (en algunos contextos)</li>
     </ul>
     <button id="cerrar-gestos">Cerrar</button>
   `;
   overlay.appendChild(modal);
   document.body.appendChild(overlay);

   document.getElementById("cerrar-gestos").addEventListener("click", () => {
     if (document.body.contains(overlay)) {
       document.body.removeChild(overlay);
     }
   });
 }

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
    productosLista = data; // Almacenar los productos en el array
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

function mostrarConfirmacion(producto) {
  // Crear overlay para la ventana modal
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  // Crear la ventana modal
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <p>¿Añadir "${producto.nombre}" al carrito?</p>
    <p>Mueve el móvil a la derecha para CONFIRMAR o a la izquierda para CANCELAR.</p>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Función para cerrar el modal y quitar el listener
  function cerrarModal() {
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay);
    }
  }
  // Función que maneja el gesto de confirmación/cancelación
  function confirmarGesto(direccion) {
    if (direccion === "derecha") {
      cerrarModal();
      gestosNav = true; // Volver a habilitar gestos de navegación
      alert(`Producto "${producto.nombre}" añadido al carrito.`);
      socket.emit("carrito-agregar", producto);
    } else if (direccion === "izquierda") {
      alert("Acción cancelada.");
      cerrarModal();
      gestosNav = true; // Volver a habilitar gestos de navegación
    }
  }

  socket.once("gesto-navegacion-server", confirmarGesto);
}
// Escuchar gestos de navegación

socket.on("gesto-navegacion-server", (direccion) => {
  if (!gestosNav) return; // Si no se deben ejecutar los gestos, salir de la función
    if (direccion === "abajo") {
        console.log("Movimiento brusco Z NEGATIVA");
        console.log("Seleccionado:", seleccionado);
        console.log("Productos:", productosLista.length);
        seleccionado = (seleccionado + 1) % productosLista.length;
        console.log("Seleccionado:", seleccionado);
        resaltarProducto(seleccionado);
    } else if (direccion === "arriba") {
        console.log("Movimiento brusco Z POSITIVA");
        seleccionado = (seleccionado - 1 + productosLista.length) % productosLista.length;
        resaltarProducto(seleccionado);
    } else if (direccion === "derecha") {
        console.log("Gesto de dercha detectado");
        gestosNav = false;
        mostrarConfirmacion(productosLista[seleccionado]);
        
    }
});


  socket.on ("cambio-pagina-server", (pagina) => {
    console.log("cambio de pagina", pagina)
    window.location.href = pagina;
  });
});
