# Proyecto AEKI (Prototipo Interactivo)
***Breve descripción***
Aplicación prototipo interactiva para mejorar la experiencia de compra en tienda física inspirada en IKEA, integrando control por voz, gestos y NFC para navegación y gestión de productos.

***Qué hace el proyecto***
Permite a los usuarios consultar un catálogo de productos, gestionar un carrito de compras, añadir productos mediante NFC y visualizar la ubicación física de productos en un almacén con un mapa interactivo y rutas calculadas.

***Tecnologías usadas***
- Backend: Node.js, Express, Socket.IO

- Frontend: HTML, CSS, JavaScript

- APIs Web: DeviceMotion (sensores de móvil), SpeechRecognition (comandos de voz), Web NFC

- Mapa interactivo mediante Leaflet y algoritmo A* para rutas

- Comunicación en tiempo real con WebSocket (Socket.IO)

***Cómo se ejecuta***
- Instalar dependencias de Node.js con npm install

- Ejecutar el servidor con node server.js

- Acceder a la aplicación web a través del navegador en la dirección configurada (localhost o IP)

- Navegar usando voz o gestos según se seleccione

- Escanear etiquetas NFC para añadir productos al carrito

- Visualizar mapa para localizar productos en almacén

***Ejemplo de salida o captura***
- Pantallas con lista de productos, carrito y mapa del almacén.

- Mensajes visuales y sonoros confirmando acciones como añadir o eliminar productos.

- Visualización de ruta optimizada en tienda hacia productos en el carrito.

- Reconocimiento de movimientos y comandos para navegación sin contacto táctil.
