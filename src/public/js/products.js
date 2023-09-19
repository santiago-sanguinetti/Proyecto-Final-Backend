function agregarAlCarrito(event, productId) {
    event.preventDefault();

    fetch(`/api/carts/6509ec5bdc95728198f484f9/product/${productId}`, {
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
