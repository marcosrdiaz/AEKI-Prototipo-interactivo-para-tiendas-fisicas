
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
    }
    // Asegurar que el contenedor mantenga su alineación
    const container = document.querySelector('.container');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';

//==================== VOZ ===========================================

    const startRecognitionButton = document.querySelector("#start-recognition");
    // Verifica si el navegador soporta SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        infoVoice.textContent = 'Tu navegador no soporta la API de Reconocimiento de Voz.';
    } else {
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
    
        voiceButton.addEventListener('click', () => {
            // Cambiar el texto y el color del botón
            const buttonText = voiceButton.querySelector('span');
            buttonText.textContent = 'Escuchando...';
            voiceButton.style.backgroundColor = '#D67942'; // Cambiar a un color diferente mientras escucha
        
            // Mostrar el mensaje de información más abajo
            infoVoice.textContent = 'Reconocimiento de voz activado. Di "Mapa", "Carrito" o "Comprar Producto".';
            infoVoice.style.marginTop = '1rem'; // Añadir espacio entre el botón y el texto
            console.log('Escuchando...');
            recognition.start();
        
            // Restaurar el texto, el color y la imagen del botón cuando termine de escuchar
            recognition.onend = () => {
                buttonText.textContent = 'Iniciar Reconocimiento de Voz';
                voiceButton.style.backgroundColor = '#90BFEE'; // Restaurar el color original
            };
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

}

//======================= GESTOS ================================================

// Verificar si el dispositivo soporta DeviceMotionEvent
if (typeof DeviceMotionEvent !== 'undefined') {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if ((permissionState === 'granted') && (modeLabel.textContent === 'GESTOS')) {
                    activarDeteccionMovimiento();
                    console.log('DANZA KUDUROOOOOOOOOOOOOOOOOOOOOOOOOO');
                } else {
                    console.log('Permiso para DeviceMotionEvent denegado.');
                }
            })
            .catch(console.error);
    } else {
        activarDeteccionMovimiento();
    }
} else {
    console.log('DeviceMotionEvent no está soportado.');
}

function activarDeteccionMovimiento() {
    let puedeDetectar = true; // Controlar el tiempo de espera entre detecciones

    window.addEventListener('devicemotion', (event) => {
        if (!puedeDetectar) return;

        const umbral = 15; // Umbral para detectar movimientos bruscos
        const { x, y, z } = event.acceleration;

        // Detectar si es un gesto de agitar
        if (Math.abs(x) > umbral && Math.abs(y) > umbral && Math.abs(z) > umbral) {
            console.log('Gesto de agitar detectado');
            socket.emit("gesto-navegacion", 'agitar');
        } else if (x > umbral) {
            console.log('Movimiento brusco X POSITIVA');
            socket.emit("gesto-navegacion", 'derecha');
        } else if (x < -umbral) {
            console.log('Movimiento brusco X NEGATIVA');
            socket.emit("gesto-navegacion", 'izquierda');
        } else if (z > umbral) {
            console.log('Movimiento brusco Z POSITIVA');
            socket.emit("gesto-navegacion", 'arriba');
        }else {
            return; // No se detectó movimiento brusco
        }

        // Desactivar detección temporalmente
        puedeDetectar = false;
        setTimeout(() => {
            puedeDetectar = true; // Reactivar detección después de 1 segundo
        }, 1000);
    });
}

});
