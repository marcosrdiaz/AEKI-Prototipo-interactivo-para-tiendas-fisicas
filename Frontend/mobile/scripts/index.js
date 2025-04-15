const socket = io();
const modeLabel = document.getElementById('modeLabel');
const voiceButton = document.getElementById('voiceButton');
const infoVoice = document.getElementById('infoVoice');



socket.on("status-server", (data) => {
    actualizarEstado(data);
  
  });

// Enviar el estado actual al servidor al cargar la página
window.addEventListener('load', () => {
    socket.on("request-status", (data) => {
        actualizarEstado(data);
      
      });
  });

function actualizarEstado(data){
    modeLabel.textContent = data.modo;
    console.log('Modo cambiado a: ', data);

    if (data.modo === 'VOZ') {
        voiceButton.style.display = 'block'; // Mostrar el botón
        infoVoice.style.display = 'block'; // Mostrar el texto de información

    } else {
        voiceButton.style.display = 'none'; // Ocultar el botón
        infoVoice.style.display = 'none'; // Ocultar el texto de información
    }


}
