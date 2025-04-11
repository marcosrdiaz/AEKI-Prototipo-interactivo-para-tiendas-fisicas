const botones = document.querySelectorAll('.button');
    let seleccionado = 0;

    function resaltarBoton(index) {
      botones.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
      });
    }

    function activarBoton(index) {
      const accion = botones[index].textContent;
      alert(`Acción: ${accion}`);
    }

    // Navegación simulada con flechas izquierda/derecha y Enter
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        seleccionado = (seleccionado + 1) % botones.length;
        resaltarBoton(seleccionado);
      } else if (e.key === 'ArrowLeft') {
        seleccionado = (seleccionado - 1 + botones.length) % botones.length;
        resaltarBoton(seleccionado);
      } else if (e.key === 'Enter') {
        activarBoton(seleccionado);
      }
    });

    // Inicial
    resaltarBoton(seleccionado);