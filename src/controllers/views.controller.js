import productManager from "../dao/managers/products.manager.js";
import cartManager from "../dao/managers/carts.manager.js";
import { cartModel } from "../dao/models/carts.model.js";

const productsManager = new productManager();
const cartsManager = new cartManager();

export const getRealtimeProducts = async (req, res) => {
    try {
        const products = await productsManager.getAll();
        res.render("realTimeProducts", { products });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const showCart = async (req, res) => {
    //Por ahora funciona con un solo carrito luego funcionará con :cid
    const { cid } = req.params;

    try {
        //Esto lo tengo que cambiar al manager cuando quite el cart hardcoded
        const cart = await cartModel
            .findById("650a07c3860aebb9f03b2e69") //cid
            .populate("products.productId")
            .lean();
        // console.log(JSON.stringify(cart, null, 2));
        res.render("cart", { cart: cart });
    } catch (err) {
        res.status(500).send(err.message);
    }
};
