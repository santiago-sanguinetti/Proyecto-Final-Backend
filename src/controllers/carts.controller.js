import Carts from "../dao/managers/carts.manager.js";

const cartsManager = new Carts();

//Crear un carrito
export const createCart = async (req, res) => {
    const cart = {
        products: req.body.products,
    };

    try {
        const newCart = await cartsManager.createCart(cart);
        res.status(201).json(newCart);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

//Agregar un producto al carrito seleccionado
export const addProductToCart = async (req, res) => {
    try {
        const cart = await cartsManager.getBy({ _id: req.params.cid });
        if (cart == null) {
            return res
                .status(404)
                .json({ message: "No se pudo encontrar el carrito" });
        }

        const productIndex = cart.products.findIndex(
            (p) => p.productId.toString() === req.params.pid
        );
        if (productIndex > -1) {
            // Si el producto ya existe en el carrito, incrementa la cantidad
            cart.products[productIndex].quantity += 1;
        } else {
            // Si el producto no existe en el carrito, lo agrega
            cart.products.push({ productId: req.params.pid, quantity: 1 });
        }

        const updatedCart = await cartsManager.saveCart(cart);
        res.json(updatedCart);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

//Obtener un carrito por su id
export const getCartById = async (req, res) => {
    const { cid } = req.params;
    try {
        // const cart = await cartModel.findById(cid).populate("products");
        const cart = await cartsManager.getBy({ _id: cid });
        if (cart == null) {
            return res
                .status(404)
                .json({ message: "No se pudo encontrar el carrito" });
        }
        const populatedCart = await cartsManager.populateProducts(cart);
        res.json({ populatedCart });
    } catch (err) {
        res.json({ status: "error", message: err.message });
    }
};

//Eliminar del carrito un producto
export const deleteProductFromCart = async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const cart = await cartsManager.getBy({ _id: cid });
        cart.products = cart.products.filter(
            (product) => product._id.toString() !== pid
        );
        await cartsManager.saveCart(cart);
        res.json({
            status: "success",
            message: "Producto eliminado del carrito",
        });
    } catch (err) {
        res.json({ status: "error", message: err.message });
    }
};

//Actualizar el carrito con array de productos
export const updateCartFromArray = async (req, res) => {
    const { cid } = req.params;
    const products = req.body.products;
    try {
        const cart = await cartsManager.getBy({ _id: cid });
        cart.products = products;
        await cartsManager.saveCart(cart);
        res.json({ status: "success", message: "Carrito actualizado" });
    } catch (err) {
        res.json({ status: "error", message: err.message });
    }
};

//Actualizar la cantidad de un producto en el carrito
export const updateCartProductQuantity = async (req, res) => {
    const { cid, pid } = req.params;
    const quantity = req.body.quantity;
    try {
        const cart = await cartsManager.getBy({ _id: cid });
        const product = cart.products.find(
            (product) => product._id.toString() === pid
        );
        if (product) {
            product.quantity = quantity;
            await cartsManager.saveCart(cart);
            res.json({
                status: "success",
                message: "Cantidad de producto actualizada",
            });
        } else {
            res.json({
                status: "error",
                message: "Producto no encontrado en el carrito",
            });
        }
    } catch (err) {
        res.json({ status: "error", message: err.message });
    }
};

//Eliminar todos los productos del carrito
export const clearCart = async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartsManager.getBy({ _id: cid });
        cart.products = [];
        await cartsManager.saveCart(cart);
        res.json({
            status: "success",
            message: "Todos los productos eliminados del carrito",
        });
    } catch (err) {
        res.json({ status: "error", message: err.message });
    }
};
