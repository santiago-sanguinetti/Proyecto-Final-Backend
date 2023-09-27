import express from "express";
import { userModel } from "../dao/models/users.model.js";
import { checkAuth, checkNotAuth } from "./views.router.js";
import bcrypt from "bcrypt";
import passport from "passport";

const router = express.Router();

router.post(
    "/register",
    checkNotAuth,
    passport.authenticate("register", {
        // successRedirect: "/profile",
        failureRedirect: "/register",
    }),
    async (req, res) => {
        // res.send({ status: "success", message: "User registered" });
        req.session.user = user;
        res.redirect("/login");
    }
);

router.post(
    "/login",
    checkNotAuth,
    passport.authenticate("login", {
        // successRedirect: "/profile",
        failureRedirect: "/login",
    }),
    async (req, res) => {
        if (!req.user)
            return res
                .status(400)
                .send({ status: "error", error: "Invalid credentials" });

        if (req.user.email === "adminCoder@coder.com") {
            req.session.user = {
                _id: "42",
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                age: req.user.age,
                email: req.user.email,
                role: "admin",
            };
            res.redirect("/profile");
        } else {
            req.session.user = {
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                age: req.user.age,
                email: req.user.email,
                role: req.user.role,
            };
            // return res.send({ status: "success", payload: req.user });
            res.redirect("/profile");
        }
    }
);
// router.post("/register", checkNotAuth, async (req, res) => {
//     try {
//         const { first_name, last_name, email, age, password } = req.body;
//         //Si se quisiera guardar el admin en la base de datos se puede registrar con estos datos
//         const role =
//             email === "adminCoder@coder.com" && password === "adminCod3r123"
//                 ? "admin"
//                 : "usuario";
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = new userModel({
//             first_name,
//             last_name,
//             email,
//             age,
//             password: hashedPassword,
//             role,
//         });

//         await user.save();
//         req.session.user = user;
//         res.redirect("/products");
//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     }
// });

// router.post("/login", checkNotAuth, async (req, res) => {
//     const { email, password } = req.body;
//     if (isAdmin(email, password)) {
//         req.session.user = { email, role: "admin" };
//         res.redirect("/profile");
//     } else {
//         const user = await userModel.findOne({ email });

//         if (user && (await bcrypt.compare(password, user.password))) {
//             req.session.user = user;
//             res.redirect("/products");
//         } else {
//             res.redirect("/login");
//         }
//     }
// });

router.post("/logout", checkAuth, (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

router.get(
    "/github",
    passport.authenticate("github", { scope: ["user:email"] }),
    async (req, res) => {}
);

router.get(
    "/githubcallback",
    passport.authenticate("github", { failureRedirect: "/login" }),
    async (req, res) => {
        req.session.user = req.user;
        res.redirect("/");
    }
);

export default router;
