import express from "express";
import { userModel } from "../dao/models/users.model.js";
import { checkAuth, checkNotAuth } from "./views.router.js";

const router = express.Router();

router.post("/register", checkNotAuth, async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;
        const role =
            email === "adminCoder@coder.com" && password === "adminCod3r123"
                ? "admin"
                : "usuario";
        const user = new userModel({
            first_name,
            last_name,
            email,
            age,
            password,
            role,
        });
        console.log(user);
        await user.save();
        req.session.user = user;
        res.redirect("/products");
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.post("/login", checkNotAuth, async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email, password });
    if (user) {
        req.session.user = user;
        res.redirect("/products");
    } else {
        res.redirect("/login");
    }
});

router.post("/logout", checkAuth, (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

export default router;
