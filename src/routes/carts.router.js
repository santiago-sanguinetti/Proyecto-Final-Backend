import express from "express";
import { cartModel } from "../dao/models/carts.model.js";

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
    try {
        const cart = await cartModel
            .findById(req.params.cid)
            .populate("products.productId");
        if (cart == null) {
            return res
                .status(404)
                .json({ message: "No se pudo encontrar el carrito" });
        }
        res.json(cart.products);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

export default router;
