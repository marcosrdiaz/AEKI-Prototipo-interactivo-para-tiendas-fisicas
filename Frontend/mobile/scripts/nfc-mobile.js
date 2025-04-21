document.addEventListener('DOMContentLoaded', () => {
    const scanButton = document.getElementById('scanButton');
    const messageContainer = document.getElementById('messageContainer');
    const socket = io();
    const botonatras = document.getElementById("boton-atras");

    botonatras.addEventListener("click", () => {
        window.location.href = 'index.html'; // Redirigir a la página de inicio
        socket.emit('cambio-pagina', 'index.html'); // Enviar evento al servidor
      });

      socket.on("cambio-pagina-server", (pagina) => {
        window.location.href = pagina;});

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
});