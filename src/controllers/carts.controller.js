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

//Completar compra y generar ticket
export const completePurchase = async (req, res) => {
    try {
        // Obtiene el id del carrito de la solicitud
        const cartId = req.params.cid;
        // Busca el carrito en la base de datos
        const cart = await cartsManager.getBy({ _id: cartId });
        // Inicializa el total de la compra y el array de productos sin stock
        let totalAmount = 0;
        let outOfStockProducts = [];

        // Si el carrito está vacío, devuelve un error
        if (!cart || cart.products[0] === null)
            return res.status(400).json({ error: "El carrito está vacío" });

        // Itera sobre los productos en el carrito
        for (let product of cart.products) {
            // Busca el producto en la base de datos
            const dbProduct = await productsManager.getBy({
                _id: product.productId,
            });

            // Si hay suficiente stock del producto, actualiza el stock y suma el precio al total
            if (await checkStock(dbProduct, product.quantity)) {
                await productsManager.updateProductStock(
                    dbProduct,
                    product.quantity
                );
                totalAmount += dbProduct.price * product.quantity;
            } else {
                // Si no hay suficiente stock, agrega el producto al array de productos sin stock
                outOfStockProducts.push(product);
            }
        }

        // Si hay productos sin stock, actualiza el carrito para que solo contenga estos productos y devuelve un error
        if (outOfStockProducts.length > 0) {
            cart.products = outOfStockProducts;
            await cartsManager.updateCart(cart);
            return res.status(400).json({
                error: "No hay suficiente stock para los siguientes productos: ",
                products: outOfStockProducts.map((item) => item.productId),
            });
        }

        // Crea los detalles de la compra
        const purchaseDetails = {
            code: generateCode(),
            amount: totalAmount,
            purchaser: req.user.email,
        };

        // Crea un ticket para la compra
        ticketsManager.createPurchaseTicket(purchaseDetails);

        res.status(200).json({ message: "Compra finalizada con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Hubo un error al procesar la compra" });
    }
};

const checkStock = async (product, productQuantity) => {
    return product.stock >= productQuantity;
};
