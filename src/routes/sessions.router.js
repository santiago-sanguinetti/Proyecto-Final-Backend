import express from "express";
import passport from "passport";
import {
    isAuthenticated,
    isAdmin,
    isUser,
    authenticate,
} from "../auth/middlewares.js";

const router = express.Router();

router.post(
    "/register",

    passport.authenticate("register", {
        successRedirect: "/login",
        failureRedirect: "/register",
    })
);

router.post("/login", authenticate);

router.post("/logout", isAuthenticated, (req, res) => {
    console.log(res);
    res.clearCookie("token"); //No está funcionando
    req.logout();
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

router.get("/current", isAuthenticated, (req, res) => {
    res.json({
        message: "Autenticado correctamente",
        user: req.user,
        token: req.cookies.token,
    });
});

export default router;
