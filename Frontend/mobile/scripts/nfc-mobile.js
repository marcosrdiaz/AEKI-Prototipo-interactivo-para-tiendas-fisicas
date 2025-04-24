import {activarDeteccionMovimiento} from './gestos.js';
import {initVoiceRecognition} from './voz.js'; // Importar la función de voz

document.addEventListener('DOMContentLoaded', () => {
    const scanButton = document.getElementById('scanButton');
    const messageContainer = document.getElementById('messageContainer');
    const socket = io();
    const botonatras = document.getElementById("boton-atras");
    const modeLabel = document.getElementById('modeLabel');


    botonatras.addEventListener("click", () => {
        window.location.href = 'index.html'; // Redirigir a la página de inicio
        socket.emit('cambio-pagina', 'index.html'); // Enviar evento al servidor
      });

  socket.emit("identificar", "mobile");
  socket.on("tipo-confirmado", (tipo) => {
    console.log("Tipo de dispositivo confirmado:", tipo);
  });

  socket.emit("solicitar-estado"); 
  

  socket.on("cambio-pagina-server", (pagina) => {
  window.location.href = pagina;});

  // Verificar si el dispositivo soporta DeviceMotionEvent
  if (typeof DeviceMotionEvent !== 'undefined') {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if ((permissionState === 'granted') && (modeLabel.textContent === 'GESTOS')) {
                    activarDeteccionMovimiento(socket);
                } else {
                    console.log('Permiso para DeviceMotionEvent denegado.');
                }
            })
            .catch(console.error);
    } else {
        activarDeteccionMovimiento(socket);
    }
  } else {
    console.log('DeviceMotionEvent no está soportado.');
  }

    scanButton.addEventListener('click', async () => {
        if ("NDEFReader" in window) {
            try {
                const nfc = new NDEFReader();
                await nfc.scan();
                messageContainer.textContent = "Escanea un tag NFC";

                nfc.addEventListener('reading', async ({ message }) => {
                    console.log("Tag NFC escaneado:", message);
                    const records = message.records;
                    for (const record of records) {
                        if (record.recordType === "text") {
                            const textDecoder = new TextDecoder(record.encoding || "utf-8");
                            const productID = textDecoder.decode(record.data);
                            console.log("Texto del NFC:", productID);

                            fetch(`http://localhost:4000/productos/${productID}`)
                            .then((response) => {
                                if (!response.ok) {
                                    throw new Error(`Error al obtener el producto ${productID}`);
                                }
                                return response.json();
                            })

                            .then ((data) => {
                                const producto = data;
                                if (producto) {
                                    // Crear el pop-up con la información del producto
                                    const popup = document.createElement("div");
                                    popup.className = "popup";

                                    popup.innerHTML = `
                                        <div class="popup-content">
                                            <h2>${producto.nombre}</h2>
                                            <p><strong>Descripción:</strong> ${producto.descripcion}</p>
                                            <p><strong>Color:</strong> ${producto.color}</p>
                                            <p><strong>Precio:</strong> $${producto.precio.toFixed(2)}</p>
                                            <button id="popup-yes">Sí</button>
                                            <button id="popup-no">No</button>
                                        </div>
                                    `;

                                    document.body.appendChild(popup);

                                    // Asignar eventos a los botones del pop-up
                                    document.getElementById("popup-yes").addEventListener("click", () => {
                                        document.body.removeChild(popup);
                                        socket.emit("carrito-agregar", producto);
                                        
                                    });

                                    document.getElementById("popup-no").addEventListener("click", () => {
                                        document.body.removeChild(popup);
                                    });
                                } else {
                                    messageContainer.textContent = `Producto no encontrado: ${productID}`;
                                }
                            });
                            
                            
                        }
                    }
                });
            } catch (error) {
                console.error("Error al escanear el tag NFC:", error);
                messageContainer.textContent = "Error al escanear el tag NFC.";
            }
        } else {
            messageContainer.textContent = "NFC no es soportado en este dispositivo.";
        }
    });

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
   alert('Tu navegador no soporta la API de Reconocimiento de Voz.');
} else {
    const recognition = initVoiceRecognition({
        lang: 'es-ES',
        continuous: false,
        interimResults: false,
        onResult: (transcript) => {
          if (transcript.includes('atrás')) {
            window.location.href = 'index.html';
            socket.emit("cambio-pagina", 'index.html');
          }
        },
        onEnd: () => {
          recognition.startRecognition(); // Reiniciar el reconocimiento al finalizar
        }

      });
    
        socket.once("entrada-server", (data) => {
        modeLabel.textContent = data;  
        if (modeLabel.textContent === "VOZ") {
            console.log('Reconocimiento de voz activado');
            recognition.startRecognition();
             // Iniciar el reconocimiento al cargar la página
        }
        else {
            console.log('Reconocimiento de voz desactivado');
        }
    });
      
}

});