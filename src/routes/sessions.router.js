import express from "express";
import passport from "passport";
import { verifyToken, authenticate } from "../auth/middlewares.js";
import {
    forgotPassword,
    resetPassword,
    swapUserRole,
} from "../controllers/users.controller.js";

const router = express.Router();

router.post(
    "/register",

    passport.authenticate("register", {
        successRedirect: "/login",
        failureRedirect: "/register",
    })
);

router.post("/login", authenticate);

router.post("/logout", verifyToken, (req, res) => {
    res.clearCookie("token");
    req.logout();
    req.session.destroy();
});

router.post("/forgot-my-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

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

router.get("/current", verifyToken, (req, res) => {
    res.json({
        message: "Autenticado correctamente",
        user: req.user,
    });
});

router.put("/premium/:uid", swapUserRole);

export default router;
