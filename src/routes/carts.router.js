import express from "express";
import { cartModel } from "../dao/models/carts.model.js";
import { productModel } from "../dao/models/products.model.js";

const router = express.Router();

//Crear un carrito
router.post("/", async (req, res) => {
    const cart = new cartModel({
        products: req.body.products,
    });

    try {
        const newCart = await cart.save();
        res.status(201).json(newCart);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//Agregar un producto al carrito seleccionado
router.post("/:cid/product/:pid", async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid);
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

        const updatedCart = await cart.save();
        res.json(updatedCart);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

//Obtener un carrito por su id
router.get("/:cid", async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartModel.findById(cid).populate("products");
        res.json({ status: "success", payload: cart.products });
    } catch (err) {
        res.json({ status: "error", message: err.message });
    }
});

//Eliminar del carrito un producto
router.delete("/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const cart = await cartModel.findById(cid);
        cart.products = cart.products.filter(
            (product) => product._id.toString() !== pid
        );
        await cart.save();
        res.json({
            status: "success",
            message: "Producto eliminado del carrito",
        });
    } catch (err) {
        res.json({ status: "error", message: err.message });
    }
});

//Actualizar el carrito con array de productos
router.put("/:cid", async (req, res) => {
    const { cid } = req.params;
    const products = req.body.products;
    try {
        const cart = await cartModel.findById(cid);
        cart.products = products;
        await cart.save();
        res.json({ status: "success", message: "Carrito actualizado" });
    } catch (err) {
        res.json({ status: "error", message: err.message });
    }
});

//Actualizar la cantidad de un producto en el carrito
router.put("/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    const quantity = req.body.quantity;
    try {
        const cart = await cartModel.findById(cid);
        const product = cart.products.find(
            (product) => product._id.toString() === pid
        );
        if (product) {
            product.quantity = quantity;
            await cart.save();
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
});

//Eliminar todos los productos del carrito
router.delete("/:cid", async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartModel.findById(cid);
        cart.products = [];
        await cart.save();
        res.json({
            status: "success",
            message: "Todos los productos eliminados del carrito",
        });
    } catch (err) {
        res.json({ status: "error", message: err.message });
    }
});

export default router;
