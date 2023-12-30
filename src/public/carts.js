function deleteFromCart(event, productId, cartId) {
    event.preventDefault();

    fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: "DELETE",
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            Swal.fire(
                "¡Producto eliminado!",
                "El producto se ha eliminado del carrito con éxito.",
                "success"
            ).then(() => {
                location.reload(); // Recarga la página
            });
        })
        .catch((error) => {
            console.error("Error:", error);
            Swal.fire(
                "¡Error!",
                "Hubo un problema al eliminar el producto del carrito.",
                "error"
            );
        });
}
