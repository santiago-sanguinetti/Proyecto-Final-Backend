import { Router } from "express";
import { getAllProducts } from "../controllers/products.controller.js";
import {
    getRealtimeProducts,
    showCart,
} from "../controllers/views.controller.js";

const router = Router();

router.get("/", async (req, res) => {
    res.redirect("/products");
});

router.get("/realtimeproducts", getRealtimeProducts);

router.get("/products", checkAuth, getAllProducts);

router.get("/cart", checkAuth, showCart);

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
