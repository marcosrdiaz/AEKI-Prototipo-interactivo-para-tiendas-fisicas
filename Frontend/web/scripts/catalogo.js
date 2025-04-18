// Realizar la petición GET para obtener los productos
fetch('http://localhost:3000/productos')
.then(response => {
    if (!response.ok) {
        throw new Error('Error al obtener los productos');
    }
    return response.json();
})
.then(data => {
    const productos = data;
    const container = document.getElementById('productos-container');
    container.innerHTML = ''; // Limpiar el contenido inicial

    if (productos.length === 0) {
        container.innerHTML = '<p>No hay productos disponibles.</p>';
        return;
    }

    // Crear elementos para cada producto
    productos.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto';

        productoDiv.innerHTML = `
            <h2>${producto.nombre}</h2>
            <p><strong>Descripción:</strong> ${producto.descripcion}</p>
            <p><strong>Color:</strong> ${producto.color}</p>
            <p><strong>Precio:</strong> $${producto.precio.toFixed(2)}</p>
            <p><strong>Unidades en stock:</strong> ${producto.unidades_en_stock}</p>
            <p><strong>Localización:</strong> ${producto.localizacion_en_almacen}</p>
            <button class="add-to-cart" data-id="${producto.id}">Añadir al carrito</button>
        `;

        container.appendChild(productoDiv);
    });

// Agregar eventos a los botones "Añadir al carrito"
const botones = document.querySelectorAll('.add-to-cart');
botones.forEach(boton => {
    boton.addEventListener('click', (event) => {
        const productId = event.target.getAttribute('data-id');
        const producto = productos.find(p => p.id === productId);

        // Obtener el carrito actual del localStorage
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        // Añadir el producto al carrito
        carrito.push(productId);

        // Guardar el carrito actualizado en el localStorage
        localStorage.setItem('carrito', JSON.stringify(carrito));

        alert(`Producto "${producto.nombre}" añadido al carrito.`);
    });
});

})
.catch(error => {
    const container = document.getElementById('productos-container');
    container.innerHTML = `<p>Error: ${error.message}</p>`;




});


