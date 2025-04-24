export function activarDeteccionMovimiento(socket) {
    
    let puedeDetectar = true; // Controlar el tiempo de espera entre detecciones
    window.addEventListener('devicemotion', (event) => {
        if (!puedeDetectar) return;

        const umbral = 15; // Umbral para detectar movimientos bruscos
        const { x, y, z } = event.acceleration;

        // Detectar si es un gesto de agitar
        if (Math.abs(x) > (umbral-10) && Math.abs(y) > (umbral-10) && Math.abs(z) > (umbral-10)) {
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
            
        } else if (z < -umbral) {
            console.log('Movimiento brusco Z NEGATIVA');
            socket.emit("gesto-navegacion", 'abajo');
        }
        else {
            return; // No se detectó movimiento brusco
        }

        // Desactivar detección temporalmente
        puedeDetectar = false;
        setTimeout(() => {
            puedeDetectar = true; // Reactivar detección después de 1 segundo
        }, 1000);
    });
}