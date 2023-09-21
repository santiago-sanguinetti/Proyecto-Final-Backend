import express from "express";
import { userModel } from "../dao/models/users.model.js";
import { checkAuth, checkNotAuth } from "./views.router.js";

const router = express.Router();

function isAdmin(email, password) {
    const adminEmail = "adminCoder@coder.com";
    const adminPassword = "adminCod3r123";
    //Devuelve un booleano si coinciden los datos
    return email === adminEmail && password === adminPassword;
}
router.post("/register", checkNotAuth, async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;
        //Si se quisiera guardar el admin en la base de datos se puede registrar con estos datos
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

        await user.save();
        req.session.user = user;
        res.redirect("/products");
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.post("/login", checkNotAuth, async (req, res) => {
    const { email, password } = req.body;
    if (isAdmin(email, password)) {
        req.session.user = { email, role: "admin" };
        res.redirect("/profile");
    } else {
        const user = await userModel.findOne({ email, password });

        if (user) {
            req.session.user = user;
            res.redirect("/products");
        } else {
            res.redirect("/login");
        }
    }
});

router.post("/logout", checkAuth, (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

export default router;
