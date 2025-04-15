
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
            } 
            else if (transcript.includes('mapa')) {
                window.location.href = 'mapa-mobile.html'; 
            }
            else if (transcript.includes('producto') || transcript.includes('n-f-c')) {
                window.location.href = 'nfc-mobile.html'; 
            }
        } else {
            weatherInfo.textContent = 'No se detectó ninguna voz. Por favor, intenta de nuevo.';
        }
    };

    recognition.onerror = (event) => {
        weatherInfo.textContent = `Error en el reconocimiento de voz: ${event.error}`;
    };}