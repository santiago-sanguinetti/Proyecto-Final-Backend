import Carts from "../dao/managers/carts.manager.js";
import Products from "../dao/managers/products.manager.js";
import Tickets from "../dao/managers/ticket.manager.js";
import { generateCode } from "../utils.js";
const cartsManager = new Carts();
const productsManager = new Products();
const ticketsManager = new Tickets();

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

export const completePurchase = async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await cartsManager.getBy({ _id: cartId });
        let totalAmount = 0;
        let outOfStockProducts = [];

        if (!cart || cart.products[0] === null)
            //En algún momento se me insertaba un null pero ya debería estar resuelto
            return res.status(400).json({ error: "El carrito está vacío" });

        for (let product of cart.products) {
            const dbProduct = await productsManager.getBy({
                _id: product.productId,
            });
            if (await checkStock(dbProduct, product.quantity)) {
                await productsManager.updateProductStock(
                    dbProduct,
                    product.quantity
                );
                totalAmount += dbProduct.price * product.quantity;
            } else {
                outOfStockProducts.push(product);
            }
        }
        if (outOfStockProducts.length > 0) {
            cart.products = outOfStockProducts; // Actualiza el carrito con los productos que no se pudieron comprar
            await cartsManager.updateCart(cart);
            return res.status(400).json({
                error: "No hay suficiente stock para los siguientes productos: ",
                products: outOfStockProducts.map((item) => item.productId),
            });
        }
        const purchaseDetails = {
            code: generateCode(),
            amount: totalAmount,
            purchaser: req.user.email,
        };

        ticketsManager.createPurchaseTicket(purchaseDetails);

        res.status(200).json({ message: "Compra finalizada con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Hubo un error al procesar la compra" });
    }
};

const checkStock = async (product, productQuantity) => {
    return product.stock >= productQuantity;
};
