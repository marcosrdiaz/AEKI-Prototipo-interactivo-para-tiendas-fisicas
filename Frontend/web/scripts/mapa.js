document.addEventListener("DOMContentLoaded", () => {

const socket = io();

// Identificar dispositivo como "web"
socket.emit("identificar", "web");

socket.on("tipo-confirmado", (tipo) => {
    console.log("Tipo de dispositivo confirmado:", tipo);
});

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
        const destino = productos[productoNombre];

        if (!destino) {
          alert("Producto no encontrado en el mapa.");
          return;
        }

        if (marcadorRuta) mapa.removeLayer(marcadorRuta);
        if (lineaRuta) mapa.removeLayer(lineaRuta);

        const ruta = calcularRuta(inicio, destino);

        marcadorRuta = L.marker(destino).addTo(mapa).bindPopup(productoNombre).openPopup();
        lineaRuta = L.polyline(ruta, { color: 'blue' }).addTo(mapa);
      });
    });
  }
});


const inicio = [0.8, 7]; // punto de entrada

// Grafo del almacén (nodos y conexiones)
const grafo = {
  // Pasillo central
  "9,7.2": [[8, 7.2]],
  "8,7.2": [[9, 7.2], [7, 7.2]],
  "7,7.2": [[8, 7.2], [6, 7.2], [7, 7]],
  "6,7.2": [[7, 7.2], [5, 7.2]],
  "5,7.2": [[6, 7.2], [4, 7.2], [5, 7], [5, 5]],
  "4,7.2": [[5, 7.2], [3, 7.2]],
  "3,7.2": [[4, 7.2], [2, 7], [2, 5]],

  // Conexiones con las estanterías
  "7,7": [[7, 7.2], [5, 7], [8, 5]],
  "7,5": [[7, 7.2], [5, 5], [8, 5]], // Conexión al tablero
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
};
// Crear el mapa
const mapa = L.map('mapa', {
  crs: L.CRS.Simple,
  minZoom: 6.2,
  maxZoom: 9,
  zoomSnap: 0.5
});

mapa.setView([5, 5], 0);
const bounds = [[0, 0], [10, 10]];
const image = L.imageOverlay('../images/almacen.jpg', bounds).addTo(mapa);
mapa.fitBounds(bounds);

let marcadorRuta, lineaRuta;

// Punto obligatorio por el que deben pasar todas las rutas
const puntoIntermedio = [3, 7.2];

// Función para calcular la ruta más corta usando A*
function calcularRuta(inicio, destino) {
  const inicioStr = inicio.join(",");
  const intermedioStr = puntoIntermedio.join(",");
  const destinoStr = destino.join(",");

  // Función auxiliar para calcular la ruta desde un nodo inicial a un nodo final
  const calcularSubRuta = (nodoInicioStr, nodoFinalStr) => {
      const abiertos = [nodoInicioStr];
      const cerrados = new Set();
      const costos = { [nodoInicioStr]: 0 };
      const padres = {};

      while (abiertos.length > 0) {
          const actual = abiertos.sort((a, b) => costos[a] - costos[b]).shift();
          if (actual === nodoFinalStr) break;

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

      // Reconstruir la ruta desde el nodo final al nodo inicial
      const ruta = [];
      let actual = nodoFinalStr;
      while (actual) {
          ruta.unshift(actual.split(",").map(Number));
          actual = padres[actual];
      }
      return ruta;
  };

  // Calcular la ruta desde el inicio hasta el punto intermedio
  const rutaInicioAIntermedio = calcularSubRuta(inicioStr, intermedioStr);

  // Calcular la ruta desde el punto intermedio hasta el destino
  const rutaIntermedioADestino = calcularSubRuta(intermedioStr, destinoStr);

  // Combinar ambas rutas (evitando duplicar el punto intermedio)
  return [...rutaInicioAIntermedio, ...rutaIntermedioADestino.slice(1)];
}
});