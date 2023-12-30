import productManager from "../dao/managers/products.manager.js";
import cartManager from "../dao/managers/carts.manager.js";
import userManager from "../dao/managers/users.manager.js";

const productsManager = new productManager();
const cartsManager = new cartManager();
const usersManager = new userManager();

export const getRealtimeProducts = async (req, res) => {
    try {
        const products = await productsManager.getAll();
        res.render("realTimeProducts", { products });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const showCart = async (req, res) => {
    const user = await usersManager.getBy({ _id: req.user._id });
    const cartId = user.cart;
    try {
        let cart = await cartsManager.getBy({ _id: user.cart });

        cart = await cartsManager.populateProducts(cart);
        res.render("cart", { cart: cart });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

export const adminView = async (req, res, next) => {
    try {
        if (req.user && req.user.role === "admin") {
            // Si es así, renderiza la vista de administración
            res.render("adminView", { isAdmin: true, users: req.users });
        } else {
            // Si no, redirige al usuario a la página de inicio de sesión o muestra un mensaje de error
            res.status(403).send(
                "No tienes permiso para acceder a esta página."
            );
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
};
