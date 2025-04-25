import {activarDeteccionMovimiento} from './gestos.js'; // Importar la función de gestos
import {initVoiceRecognition} from './voz.js'; // Importar la función de voz

document.addEventListener('DOMContentLoaded', () => {

const socket = io();
const modeLabel = document.getElementById('modeLabel');
const voiceButton = document.getElementById('voiceButton');
const infoVoice = document.getElementById('infoVoice');


// Identificar dispositivo como "mobile"
socket.emit("identificar", "mobile");

socket.on("tipo-confirmado", (tipo) => {
    console.log("Tipo de dispositivo confirmado:", tipo);
});

socket.on("entrada-server", (data) => {
    console.log("movil llega", data)
    actualizarEstado(data);
  });

socket.on("cambio-pagina-server", (pagina) => {
    window.location.href = pagina;});

function actualizarEstado(data){
    modeLabel.textContent = data;
    console.log('Modo cambiado a: ', data);

    if (data === 'VOZ') {
        voiceButton.style.display = 'block'; // Mostrar el botón
        infoVoice.style.display = 'block'; // Mostrar el texto de información

    } else {
        voiceButton.style.display = 'none'; // Ocultar el botón
        infoVoice.style.display = 'none'; // Ocultar el texto de información
    }};
    // Asegurar que el contenedor mantenga su alineación
    const container = document.querySelector('.container');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';

//==================== VOZ ===========================================

    // Verifica si el navegador soporta SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        infoVoice.textContent = 'Tu navegador no soporta la API de Reconocimiento de Voz.';
    } else {
        const recognition = initVoiceRecognition({
            lang: 'es-ES',
            continuous: false,
            interimResults: false,
            onStart: () => {
              voiceButton.querySelector('span').textContent = 'Escuchando...';
              voiceButton.style.backgroundColor = '#D67942';
              infoVoice.textContent = 'Indique a que página desea navegar, o si desea activar los gestos.';
            },
            onResult: (transcript) => {
              console.log('Transcripción:', transcript);
              if (transcript.includes('carrito') || transcript.includes('carro') || transcript.includes('compras') || transcript.includes('mis productos')) {
                window.location.href = 'carrito-mobile.html';
                socket.emit("cambio-pagina", 'carrito.html');
              } else if (transcript.includes('mapa') || transcript.includes('plano') || transcript.includes('ubicación') || transcript.includes('localizar')) {
                window.location.href = 'mapa-mobile.html';
                socket.emit("cambio-pagina", 'mapa.html');
              } else if (transcript.includes('escaneo') || transcript.includes('nfc') || transcript.includes('escáner') || transcript.includes('escanear') || transcript.includes('añadir')) {
                window.location.href = 'nfc-mobile.html';
                socket.emit("cambio-pagina", 'nfc.html');
              } else if (transcript.includes('catálogo') ) { 
                
                window.location.href = 'catalogo-mobile.html';
                socket.emit("cambio-pagina", 'catalogo.html');
              }
              else if (transcript.includes('gestos')) { 
              actualizarEstado('GESTOS');
              socket.emit("entrada", "GESTOS");
              }
            },
            onError: (event) => {
              infoVoice.textContent = `Error en el reconocimiento: ${event.error}`;
            },
            onEnd: () => {
              voiceButton.querySelector('span').textContent = 'Iniciar Reconocimiento de Voz';
              voiceButton.style.backgroundColor = '#90BFEE';
            }
          });
        
          voiceButton.addEventListener('click', () => {
            infoVoice.style.marginTop = '1rem';
            recognition.startRecognition();
          });
}

//======================= GESTOS ================================================

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

});