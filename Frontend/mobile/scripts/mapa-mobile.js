document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  // Identificar dispositivo como "mobile"
  socket.emit("identificar", "mobile");

  let productos = {}; // Objeto para almacenar los productos y sus coordenadas

  // Cargar datos del catálogo desde el servidor
  fetch("http://localhost:4000/api/almacen")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const catalogoContainer = document.getElementById("catalogo-container");
      data.almacen.forEach((producto) => {
        productos[producto.nombre.toLowerCase()] = producto.localizacion_en_almacen;

        // Crear una imagen para cada producto
        const img = document.createElement("img");
        img.src = producto.imagen; // Asegúrate de que el servidor devuelva la URL de la imagen
        img.alt = producto.nombre;
        img.setAttribute("data-nombre", producto.nombre);

        // Asignar evento para mostrar la ruta
        img.addEventListener("click", () => {
          const destino = productos[producto.nombre.toLowerCase()];
          if (!destino) {
            alert("Producto no encontrado en el mapa.");
            return;
          }

          // Emitir evento al servidor para sincronizar con la web
          socket.emit("mostrar-ruta", { nombre: producto.nombre, destino });

          // Mostrar la ruta en el mapa móvil
          mostrarRuta(producto.nombre, destino);
        });

        catalogoContainer.appendChild(img);
      });
    })
    .catch((error) => console.error("Error al cargar los datos del catálogo:", error));


// Crear el mapa
const mapa = L.map("mapa", {
  crs: L.CRS.Simple,
  minZoom: 5.2,
  maxZoom: 7,
  zoomSnap: 0.5,
  zoomControl: false, // Deshabilitar los botones de zoom
  doubleClickZoom: true, // Permitir zoom con doble clic
  touchZoom: true, // Permitir zoom táctil
  dragging: false, // Deshabilitar el arrastre inicialmente
});

// Configurar los límites y la imagen del almacén
const bounds = [[0, 0], [10, 10]];
const image = L.imageOverlay("../images/almacen.jpg", bounds).addTo(mapa);

// Ajustar la vista inicial del mapa
mapa.setView([0, 0], 5.2); // Nivel de zoom inicial
mapa.fitBounds(bounds);

// Habilitar o deshabilitar el arrastre según el nivel de zoom
mapa.on("zoomend", () => {
  if (mapa.getZoom() > 5.2) {
    mapa.dragging.enable(); // Permitir arrastrar si el zoom es mayor al inicial
  } else {
    mapa.dragging.disable(); // Deshabilitar arrastrar si el zoom es igual o menor al inicial
    mapa.setView([5, 5], 5.2); // Recentrar el mapa si se intenta mover
  }
});


  let marcadorRuta, lineaRuta;

  // Función para mostrar la ruta en el mapa
  function mostrarRuta(nombre, destino) {
    if (marcadorRuta) mapa.removeLayer(marcadorRuta);
    if (lineaRuta) mapa.removeLayer(lineaRuta);

    const ruta = calcularRuta([0.8, 7], destino); // Punto de entrada fijo

    marcadorRuta = L.marker(destino).addTo(mapa).bindPopup(nombre).openPopup();
    lineaRuta = L.polyline(ruta, { color: "blue" }).addTo(mapa);
  }

  // Escuchar eventos del servidor para sincronizar rutas
  socket.on("mostrar-ruta", ({ nombre, destino }) => {
    mostrarRuta(nombre, destino);
  });

  // Función para calcular la ruta más corta (A*)
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
});