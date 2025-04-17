const socket = io();

// Función para emitir eventos
export function emitEvent(eventName, data) {
    socket.emit(eventName, data);
}

// Función para escuchar eventos
export function onEvent(eventName, callback) {
    socket.on(eventName, callback);
}

// Exportar el socket para casos específicos
export default socket;