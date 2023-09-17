const socket = io();
socket.on("product-created", (product) => {
    // Crea un nuevo elemento li
    const div = document.createElement("div");
    const h2 = document.createElement("h2");
    h2.textContent = product.title; // Utiliza el título del producto como texto del h2
    div.appendChild(h2);
    const p = document.createElement("p");
    p.textContent = product.description;
    div.appendChild(p);
    div.id = product._id; // Utiliza el _id del producto como id del div

    // Añade el nuevo div a la lista de productos
    document.getElementById("products").appendChild(div);
});

socket.on("product-deleted", (productId) => {
    // Encuentra el div con el id del producto y lo elimina
    const div = document.getElementById(productId);
    if (div) {
        div.parentNode.removeChild(div);
    }
});
