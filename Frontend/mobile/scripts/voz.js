export function initVoiceRecognition(config = {}) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Tu navegador no soporta la API de Reconocimiento de Voz.');
      return null;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = config.lang || 'es-ES';
    recognition.continuous = config.continuous || false;
    recognition.interimResults = config.interimResults || false;
    
    // Función para iniciar el reconocimiento
    recognition.startRecognition = () => {
      recognition.start();
      if (config.onStart) {
        config.onStart();
      }
    };
  
    // Registrar callback para resultado
    recognition.onresult = (event) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript.toLowerCase();
        if (config.onResult) {
          config.onResult(transcript, event);
        }
      }
    };
  
    recognition.onerror = (event) => {
      if (config.onError) {
        config.onError(event);
      } else {
        console.error(`Error en el reconocimiento: ${event.error}`);
      }
    };
  
    recognition.onend = () => {
      if (config.onEnd) {
        config.onEnd();
      }
    };
  
    return recognition;
  }