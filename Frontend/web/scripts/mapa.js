document.addEventListener("DOMContentLoaded", () => {
  const socket = io();
  const botonatras = document.getElementById("boton-atras");
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

  socket.on("cambio-pagina-server", (pagina) => {
    window.location.href = pagina;});

  let productos = {}; // Objeto para almacenar los productos y sus coordenadas

  // Cargar datos del archivo almacen.json
  fetch("http://localhost:4000/api/almacen") // Cambia la ruta si es necesario
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Guardar las coordenadas de los productos en el objeto `productos`
      data.almacen.forEach((producto) => {
        productos[producto.nombre.toLowerCase()] = producto.localizacion_en_almacen;
      });
    })
    .catch((error) => console.error("Error al cargar los datos del almacén:", error));

  socket.on("carrito-actualizado", (carrito) => {
    const container = document.getElementById("carrito-container");

    // Mantener el título y el párrafo inicial
    const titulo = container.querySelector("h1");
    const parrafo = container.querySelector("p");

    // Limpiar solo los productos existentes
    const productosDivs = container.querySelectorAll(".producto");
    productosDivs.forEach((productoDiv) => productoDiv.remove());

    if (carrito.length === 0) {
      const mensajeVacio = container.querySelector(".mensaje-vacio");
      if (!mensajeVacio) {
        const mensaje = document.createElement("p");
        mensaje.className = "mensaje-vacio";
        mensaje.textContent = "El carrito está vacío.";
        container.appendChild(mensaje);
      }
    } else {
      // Eliminar mensaje de carrito vacío si existe
      const mensajeVacio = container.querySelector(".mensaje-vacio");
      if (mensajeVacio) mensajeVacio.remove();

      carrito.forEach((producto) => {
        const productoDiv = document.createElement("div");
        productoDiv.className = "producto";

        // Crear un botón para cada producto
        const boton = document.createElement("button");
        boton.className = "mostrar-ruta";
        boton.textContent = `${producto.nombre}`;
        boton.setAttribute("data-nombre", producto.nombre);

        // Agregar el botón al div del producto
        productoDiv.appendChild(boton);
        container.appendChild(productoDiv);
      });

      // Asignar eventos a los botones "Mostrar Ruta"
      document.querySelectorAll(".mostrar-ruta").forEach((button) => {
        button.addEventListener("click", (event) => {
          const productoNombre = event.target.getAttribute("data-nombre").toLowerCase();
          const destino = productos[productoNombre]; // Obtener las coordenadas del producto

          if (!destino) {
            alert("Producto no encontrado en el mapa.");
            return;
          }

          // Limpiar ruta anterior si existe
          if (marcadorRuta) mapa.removeLayer(marcadorRuta);
          if (lineaRuta) mapa.removeLayer(lineaRuta);

          // Calcular y trazar la ruta
          const ruta = calcularRuta(inicio, destino);

          // Mostrar marcador y ruta en el mapa
          marcadorRuta = L.marker(destino).addTo(mapa).bindPopup(productoNombre).openPopup();
          lineaRuta = L.polyline(ruta, { color: "blue" }).addTo(mapa);
        });
      });
    }
  });

  const inicio = [0.8, 7]; // Punto de entrada

  // Grafo del almacén (nodos y conexiones)
    const grafo = {
    // Pasillo central
    "9,7.2": [[8, 7.2], [9, 6]], // Conexión al producto en [9,6]
    "8,7.2": [[9, 7.2], [7, 7.2]],
    "7,7.2": [[8, 7.2], [6, 7.2], [7, 7]],
    "6,7.2": [[7, 7.2], [5, 7.2]],
    "5,7.2": [[6, 7.2], [4, 7.2], [5, 7], [5, 5]],
    "4,7.2": [[5, 7.2], [3, 7.2], [4, 9]],
    "3,7.2": [[4, 7.2], [2, 7], [2, 5], [3.4, 6.5]], // Conexión al producto en [3.4,6.5]
  
    // Conexiones con las estanterías
    "7,7": [[7, 7.2], [5, 7], [8, 5]],
    "7,5": [[7, 7.2], [5, 5], [8, 5]],
    "5,7": [[7, 7], [5, 7.2], [3, 7.2]],
    "5,5": [[7, 5], [5, 7.2], [3, 7.2]],
    "2,7": [[3, 7.2], [0.8, 7]],
    "2,5": [[3, 7.2], [0.8, 5]],
    "0.8,7": [[2, 7], [0.8, 5]],
    "0.8,5": [[2, 5], [0.8, 7]],
  
    // Conexiones con los productos
    "5,5": [[4, 5]], // Conexión a la silla
    "7,8": [[7, 7.2]], // Conexión al pasillo central
    "7,7.2": [[8, 7.2], [6, 7.2], [7, 7], [7, 8]], // Asegurar conexión al producto en [7, 8]
    "4,7.2": [[5, 7.2], [3, 7.2], [4, 9]], // Agregar conexión al producto en [4, 9]
    "4,9": [[4, 7.2]], // Conexión al pasillo central
  
    // Nuevos productos
    "9,6": [[9, 7.2], [8, 5]], // Conexión al pasillo central y a otro nodo cercano
    "3.4,6.5": [[3, 7.2], [2, 5]], // Conexión al pasillo central y a otro nodo cercano
  };

  // Crear el mapa
  const mapa = L.map("mapa", {
    crs: L.CRS.Simple,
    minZoom: 6.2,
    maxZoom: 9,
    zoomSnap: 0.5,
  });

  mapa.setView([5, 5], 0);
  const bounds = [[0, 0], [10, 10]];
  const image = L.imageOverlay("../images/almacen.jpg", bounds).addTo(mapa);
  mapa.fitBounds(bounds);

  let marcadorRuta, lineaRuta;

  // Función para calcular la ruta más corta usando A*
  function calcularRuta(inicio, destino) {
    const inicioStr = inicio.join(",");
    const destinoStr = destino.join(",");

    const abiertos = [inicioStr];
    const cerrados = new Set();
    const costos = { [inicioStr]: 0 };
    const padres = {};

    while (abiertos.length > 0) {
      const actual = abiertos.sort((a, b) => costos[a] - costos[b]).shift();
      if (actual === destinoStr) break;

      cerrados.add(actual);

      for (const vecino of grafo[actual] || []) {
        const vecinoStr = vecino.join(",");
        if (cerrados.has(vecinoStr)) continue;

        const nuevoCosto = costos[actual] + 1;
        if (!costos[vecinoStr] || nuevoCosto < costos[vecinoStr]) {
          costos[vecinoStr] = nuevoCosto;
          padres[vecinoStr] = actual;
          if (!abiertos.includes(vecinoStr)) abiertos.push(vecinoStr);
        }
      }
    }

    const ruta = [];
    let actual = destinoStr;
    while (actual) {
      ruta.unshift(actual.split(",").map(Number));
      actual = padres[actual];
    }
    return ruta;
  }

// Escuchar eventos del servidor para mostrar rutas desde el móvil
socket.on("mostrar-ruta", ({ nombre, destino }) => {
  if (marcadorRuta) mapa.removeLayer(marcadorRuta);
  if (lineaRuta) mapa.removeLayer(lineaRuta);

  const ruta = calcularRuta(inicio, destino);

  marcadorRuta = L.marker(destino).addTo(mapa).bindPopup(nombre).openPopup();
  lineaRuta = L.polyline(ruta, { color: "blue" }).addTo(mapa);
});


});