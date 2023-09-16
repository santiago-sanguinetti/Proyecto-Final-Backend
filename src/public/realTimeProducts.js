const socket = io();

socket.on("product-created", (product) => {
    // Crea un nuevo elemento li
    const li = document.createElement("li");
    li.textContent = product.title; // Utiliza el título del producto como texto del li
    li.id = product._id; // Utiliza el _id del producto como id del li

    // Añade el nuevo li a la lista de productos
    document.getElementById("products").appendChild(li);
});

socket.on("product-deleted", (productId) => {
    // Encuentra el li con el id del producto y lo elimina
    const li = document.getElementById(productId);
    if (li) {
        li.parentNode.removeChild(li);
    }
});
