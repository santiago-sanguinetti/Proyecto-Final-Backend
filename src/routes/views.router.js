import { Router } from "express";
import mongoose from "mongoose";
import { productModel } from "../dao/models/products.model.js";
import { cartModel } from "../dao/models/carts.model.js";
import { getAllProducts } from "../controllers/products.controller.js";

const router = Router();

router.get("/", async (req, res) => {
    res.redirect("/products");
});

router.get("/realtimeproducts", async (req, res) => {
    try {
        const products = await productModel.find().lean();
        res.render("realTimeProducts", { products });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/products", checkAuth, getAllProducts);

router.get("/cart", async (req, res) => {
    //Por ahora funciona con un solo carrito luego funcionará con :cid
    const { cid } = req.params;

    try {
        const cart = await cartModel
            .findById("650a07c3860aebb9f03b2e69") //cid
            .populate("products.productId")
            .lean();
        // console.log(JSON.stringify(cart, null, 2));
        res.render("cart", { cart: cart });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//-------------------- Login --------------------
export function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/login");
    }
}

export function checkNotAuth(req, res, next) {
    if (req.session.user) {
        res.redirect("/profile");
    } else {
        next();
    }
}

router.get("/login", checkNotAuth, (req, res) => {
    res.render("login");
});

router.get("/register", checkNotAuth, (req, res) => {
    res.render("register");
});

router.get("/profile", checkAuth, (req, res) => {
    res.render("profile", { user: req.session.user });
});

router.post("/logout", checkAuth, (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

export default router;
