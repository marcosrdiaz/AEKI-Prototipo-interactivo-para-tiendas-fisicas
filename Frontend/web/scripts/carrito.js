// Cargar productos del carrito desde el localStorage
const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
const container = document.getElementById('carrito-container');
container.innerHTML = ''; // Limpiar el contenido inicial

if (carrito.length === 0) {
  container.innerHTML = '<p>El carrito está vacío.</p>';
} else {
  carrito.forEach(producto => {
    const productoDiv = document.createElement('div');
    productoDiv.className = 'producto';

    productoDiv.innerHTML = `
      <h2>${producto.nombre}</h2>
      <p><strong>Descripción:</strong> ${producto.descripcion}</p>
      <p><strong>Color:</strong> ${producto.color}</p>
      <p><strong>Precio:</strong> $${producto.precio.toFixed(2)}</p>
      <p><strong>Unidades en stock:</strong> ${producto.unidades_en_stock}</p>
    `;

    container.appendChild(productoDiv);
  });
}