import Carts from "../dao/managers/carts.manager.js";
import Products from "../dao/managers/products.manager.js";
import Tickets from "../dao/managers/ticket.manager.js";
import { generateCode } from "../utils.js";
import EErrors from "../services/errors/enums.js";
import CustomError from "../services/errors/CustomError.js";
import {
    notFoundInDB,
    emptyCart,
    insufficientStock,
} from "../services/errors/info.js";
import mongoose from "mongoose";
import { logger } from "../config/logger.config.js";
const cartsManager = new Carts();
const productsManager = new Products();
const ticketsManager = new Tickets();

//Crear un carrito
export const createCart = async (req, res, next) => {
    logger.info("Creando un nuevo carrito");
    const cart = {
        products: req.body.products,
    };

    try {
        const newCart = await cartsManager.createCart(cart);

        const errorCause = validateCart(cart);
        if (errorCause) {
            const error = CustomError.createError({
                name: "Carrito inválido",
                cause: errorCause,
                message: "Los parámetros son inválidos",
                code: EErrors.INVALID_TYPES_ERROR,
            });
            logger.error(`Error al crear el carrito: ${error.message}`);
            return next(error);
        }

        logger.info("Carrito creado exitosamente");
        res.status(201).json(newCart);
    } catch (err) {
        logger.error(`Error al crear el carrito: ${err.message}`);
        return next(err);
    }
};
//Agregar un producto al carrito seleccionado
export const addProductToCart = async (req, res, next) => {
    logger.info("Agregando un producto al carrito");
    try {
        const cart = await cartsManager.getBy({ _id: req.params.cid });
        logger.debug(cart.products);
        if (cart == null) {
            const error = CustomError.createError({
                name: "Carrito no encontrado",
                cause: notFoundInDB("carrito"),
                message: "No se pudo encontrar el carrito",
                code: EErrors.DATABASE_ERROR,
            });
            logger.error(
                `Error al agregar producto al carrito: ${error.message}`
            );
            return next(error);
        }

        const product = await productsManager.getBy({ _id: req.params.pid });
        if (!product) {
            const error = CustomError.createError({
                name: "Producto no encontrado",
                cause: notFoundInDB("producto"),
                message: "No se pudo encontrar el producto",
                code: EErrors.DATABASE_ERROR,
            });
            logger.error(
                `Error al agregar producto al carrito: ${error.message}`
            );
            return next(error);
        }

        // Verifica si el producto pertenece al usuario
        if (product.owner.toString() === req.user._id.toString()) {
            return res.status(400).send({
                message: "No puedes agregar tus propios productos al carrito",
            });
        }

        const productIndex = cart.products.findIndex(
            (p) => p && p.productId.toString() === req.params.pid
        );
        if (productIndex > -1) {
            // Si el producto ya existe en el carrito, incrementa la cantidad
            cart.products[productIndex].quantity += 1;
            logger.info(
                "El producto ya existe en el carrito, incrementando la cantidad"
            );
        } else {
            // Si el producto no existe en el carrito, lo agrega
            cart.products.push({ productId: req.params.pid, quantity: 1 });
            logger.info("El producto no existe en el carrito, agregándolo");
        }

        const updatedCart = await cartsManager.saveCart(cart);
        logger.info("Producto agregado al carrito exitosamente");
        res.json(updatedCart);
    } catch (err) {
        logger.error(`Error al agregar producto al carrito: ${err.message}`);
        return next(err);
    }
};

//Obtener un carrito por su id
export const getCartById = async (req, res, next) => {
    logger.info("Obteniendo carrito por ID");
    const { cid } = req.params;
    try {
        // const cart = await cartModel.findById(cid).populate("products");
        const cart = await cartsManager.getBy({ _id: cid });
        if (cart == null) {
            const error = CustomError.createError({
                name: "Carrito no encontrado",
                cause: notFoundInDB("carrito"),
                message: "No se pudo encontrar el carrito",
                code: EErrors.DATABASE_ERROR,
            });
            logger.error(`Error al obtener el carrito: ${error.message}`);
            return next(error);
        }
        const populatedCart = await cartsManager.populateProducts(cart);
        logger.info("Carrito obtenido con éxito");
        res.json({ populatedCart });
    } catch (err) {
        logger.error(`Error al obtener el carrito: ${err.message}`);
        return next(err);
    }
};

//Eliminar del carrito un producto
export const deleteProductFromCart = async (req, res, next) => {
    logger.info("Eliminando producto del carrito");
    const { cid, pid } = req.params;
    try {
        const cart = await cartsManager.getBy({ _id: cid });
        if (cart == null) {
            const error = CustomError.createError({
                name: "Carrito no encontrado",
                cause: notFoundInDB("carrito"),
                message: "No se pudo encontrar el carrito",
                code: EErrors.DATABASE_ERROR,
            });
            logger.error(
                `Error al eliminar producto del carrito: ${error.message}`
            );
            return next(error);
        }
        cart.products = cart.products.filter(
            (product) => product._id.toString() !== pid
        );
        await cartsManager.saveCart(cart);
        logger.info("Producto eliminado del carrito exitosamente");
        res.json({
            status: "success",
            message: "Producto eliminado del carrito",
        });
    } catch (err) {
        logger.error(`Error al eliminar producto del carrito: ${err.message}`);
        return next(err);
    }
};

//Actualizar el carrito con array de productos
export const updateCartFromArray = async (req, res, next) => {
    logger.info("Actualizando carrito desde un array");
    const { cid } = req.params;
    const products = req.body.products;
    try {
        const cart = await cartsManager.getBy({ _id: cid });
        if (cart == null) {
            const error = CustomError.createError({
                name: "Carrito no encontrado",
                cause: notFoundInDB("carrito"),
                message: "No se pudo encontrar el carrito",
                code: EErrors.DATABASE_ERROR,
            });
            logger.error(`Error al actualizar el carrito: ${error.message}`);
            return next(error);
        }

        cart.products = products;

        const errorCause = validateCart(cart);
        if (errorCause) {
            const error = CustomError.createError({
                name: "Carrito inválido",
                cause: errorCause,
                message: "Los parámetros son inválidos",
                code: EErrors.INVALID_TYPES_ERROR,
            });
            logger.error(`Errir al actualizar el carrito: ${error.message}`);
            return next(error);
        }

        await cartsManager.saveCart(cart);
        logger.info("Carrito actualizado exitosamente");
        res.json({ status: "success", message: "Carrito actualizado" });
    } catch (err) {
        logger.error(`Error al actualizar el carrito: ${err.message}`);
        return next(err);
    }
};

//Actualizar la cantidad de un producto en el carrito
export const updateCartProductQuantity = async (req, res, next) => {
    logger.info("Actualizando la cantidad de un producto en el carrito");
    const { cid, pid } = req.params;
    const quantity = req.body.quantity;
    try {
        const cart = await cartsManager.getBy({ _id: cid });
        if (cart == null) {
            const error = CustomError.createError({
                name: "Carrito no encontrado",
                cause: notFoundInDB("carrito"),
                message: "No se pudo encontrar el carrito",
                code: EErrors.DATABASE_ERROR,
            });
            logger.error(
                `Error al actualizar la cantidad de un producto: ${error.message}`
            );
            return next(error);
        }

        const product = cart.products.find(
            (product) => product._id.toString() === pid
        );
        if (product) {
            product.quantity = quantity;

            const errorCause = validateCart(cart);
            if (errorCause) {
                const error = CustomError.createError({
                    name: "Carrito inválido",
                    cause: errorCause,
                    message: "Los parámetros son inválidos",
                    code: EErrors.INVALID_TYPES_ERROR,
                });
                logger.error(
                    `Error al actualizar la cantidad de un producto: ${error.message}`
                );
                return next(error);
            }

            await cartsManager.saveCart(cart);
            logger.info("Cantidad de producto actualizada exitosamente");
            res.json({
                status: "success",
                message: "Cantidad de producto actualizada",
            });
        } else {
            const error = CustomError.createError({
                name: "Producto no encontrado",
                cause: notFoundInDB("producto"),
                message: "Producto no encontrado en el carrito",
                code: EErrors.DATABASE_ERROR,
            });
            logger.error(
                `Error al actualizar la cantidad de un producto: ${error.message}`
            );
            return next(error);
        }
    } catch (err) {
        logger.error(
            `Error al actualizar la cantidad de un producto: ${err.message}`
        );
        return next(err);
    }
};

//Eliminar todos los productos del carrito
export const clearCart = async (req, res, next) => {
    logger.info("Vaciando el carrito");
    const { cid } = req.params;
    try {
        const cart = await cartsManager.getBy({ _id: cid });
        if (cart == null) {
            const error = CustomError.createError({
                name: "Carrito no encontrado",
                cause: notFoundInDB("carrito"),
                message: "No se pudo encontrar el carrito",
                code: EErrors.DATABASE_ERROR,
            });
            logger.error(`Error al vaciar el carrito: ${error.message}`);
            return next(error);
        }

        cart.products = [];

        const errorCause = validateCart(cart);
        if (errorCause) {
            const error = CustomError.createError({
                name: "Carrito inválido",
                cause: errorCause,
                message: "Los parámetros son inválidos",
                code: EErrors.INVALID_TYPES_ERROR,
            });
            logger.error(`Error al vaciar el carrito: ${error.message}`);
            return next(error);
        }

        await cartsManager.saveCart(cart);
        logger.info("Carrito vaciado exitosamente");
        res.json({
            status: "success",
            message: "Todos los productos eliminados del carrito",
        });
    } catch (err) {
        logger.error(`Error al vaciar el carrito: ${err.message}`);
        return next(err);
    }
};

//Completar compra y generar ticket
export const completePurchase = async (req, res, next) => {
    logger.info("Completando la compra");
    try {
        // Obtiene el id del carrito de la solicitud
        const cartId = req.params.cid;
        // Busca el carrito en la base de datos
        const cart = await cartsManager.getBy({ _id: cartId });
        // Inicializa el total de la compra y el array de productos sin stock
        let totalAmount = 0;
        let outOfStockProducts = [];

        // Si el carrito está vacío, devuelve un error
        if (!cart || cart.products[0] === null) {
            const error = CustomError.createError({
                name: "Carrito vacío",
                cause: emptyCart(cart.products),
                message: "El carrito está vacío",
                code: EErrors.EMPTY_CART_ERROR,
            });
            logger.error(`Error al completar la compra: ${error.message}`);
            return next(error);
        }

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
            const error = CustomError.createError({
                name: "Stock insuficiente",
                cause: insufficientStock(outOfStockProducts),
                message: "No hay suficiente stock para algunos productos",
                code: EErrors.INSUFFICIENT_STOCK_ERROR,
            });
            logger.error(`Error al completar la compra: ${error.message}`);
            return next(error);
        }

        // Crea los detalles de la compra
        const purchaseDetails = {
            code: generateCode(),
            amount: totalAmount,
            purchaser: req.user.email,
        };

        // Crea un ticket para la compra
        ticketsManager.createPurchaseTicket(purchaseDetails);
        logger.info("Compra finalizada exitosamente");
        res.status(200).json({ message: "Compra finalizada con éxito" });
    } catch (err) {
        logger.error(`Error al completar la compra: ${err.message}`);
        return next(err);
    }
};

const checkStock = async (product, productQuantity) => {
    logger.debug(`Verificando stock del producto ${product._id}`);
    return product.stock >= productQuantity;
};

function validateCart(cart) {
    logger.debug("Validando el carrito");
    if (!Array.isArray(cart.products)) {
        return "Los productos deben ser un array";
    }

    for (let i = 0; i < cart.products.length; i++) {
        const product = cart.products[i];
        if (
            !product.productId ||
            !mongoose.Types.ObjectId.isValid(product.productId)
        ) {
            return `El ID del producto en la posición ${i} no es válido`;
        }
        if (
            product.quantity == null ||
            typeof product.quantity !== "number" ||
            product.quantity <= 0
        ) {
            return `La cantidad del producto en la posición ${i} no es válida`;
        }
    }

    return null;
}
