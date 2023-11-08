function agregarAlCarrito(event, productId) {
    event.preventDefault();

    //Cambiar luego a :cid
    fetch(`/api/carts/650a07c3860aebb9f03b2e69/product/${productId}`, {
        method: "POST",
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            Swal.fire(
                "¡Producto agregado!",
                "El producto se ha agregado al carrito con éxito.",
                "success"
            );
        })
        .catch((error) => {
            console.error("Error:", error);
            Swal.fire(
                "¡Error!",
                "Hubo un problema al agregar el producto al carrito.",
                "error"
            );
        });
}
