document.addEventListener('DOMContentLoaded', () => {

const socket = io();

// Identificar dispositivo como "mobile"
socket.emit("identificar", "mobile");

socket.on("tipo-confirmado", (tipo) => {
    console.log("Tipo de dispositivo confirmado:", tipo);
});


//===============================================================



const modeLabel = document.getElementById('modeLabel');
const voiceButton = document.getElementById('voiceButton');
const infoVoice = document.getElementById('infoVoice');

socket.on("entrada-server", (data) => {
    console.log("movil llega", data)
    actualizarEstado(data);
  });

function actualizarEstado(data){
    modeLabel.textContent = data;
    console.log('Modo cambiado a: ', data);

    if (data === 'VOZ') {
        voiceButton.style.display = 'block'; // Mostrar el botón
        infoVoice.style.display = 'block'; // Mostrar el texto de información

    } else {
        voiceButton.style.display = 'none'; // Ocultar el botón
        infoVoice.style.display = 'none'; // Ocultar el texto de información
    }


    const startRecognitionButton = document.querySelector("#start-recognition");
    // Verifica si el navegador soporta SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        infoVoice.textContent = 'Tu navegador no soporta la API de Reconocimiento de Voz.';
    } else {
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
    
        voiceButton.addEventListener('click', () => {
            infoVoice.textContent = 'Reconocimiento de voz activado. Di "Mapa", "Carrito" o "Comprar Producto".';
            console.log('Escuchando...');
            recognition.start();
        });
    
        recognition.onresult = (event) => {
            if (event.results && event.results[0] && event.results[0][0]) {
                const transcript = event.results[0][0].transcript.toLowerCase();
                if (transcript.includes('carrito') || transcript.includes('carro')) {
                    window.location.href = 'carrito-mobile.html';
                    socket.emit("cambio-pagina", 'carrito.html'); // Enviar evento al servidor
                } 
                else if (transcript.includes('mapa')) {
                    window.location.href = 'mapa-mobile.html';
                    socket.emit("cambio-pagina", 'mapa.html'); // Enviar evento al servidor 
                }
                else if (transcript.includes('producto') || transcript.includes('n-f-c')) {
                    window.location.href = 'nfc-mobile.html';
                    socket.emit("cambio-pagina", 'nfc.html'); // Enviar evento al servidor
                }
                else if (transcript.includes('catálogo')) {
                    window.location.href = 'catalogo-mobile.html';
                    socket.emit("cambio-pagina", 'catalogo.html'); // Enviar evento al servidor
                }
                
            } else {
                weatherInfo.textContent = 'No se detectó ninguna voz. Por favor, intenta de nuevo.';
            }
        };
    
        recognition.onerror = (event) => {
            weatherInfo.textContent = `Error en el reconocimiento de voz: ${event.error}`;
        };}

}});
