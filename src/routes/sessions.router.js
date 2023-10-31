import express from "express";
import { checkAuth, checkNotAuth } from "./views.router.js";
import passport from "passport";
import { validateLogin } from "../controllers/sessions.controller.js";
import jwt from "jsonwebtoken";
import UserDTO from "../dao/DTOs/user.dto.js";
import {
    isAuthenticated,
    isAdmin,
    isUser,
    isTokenValid,
    isNotLoggedIn,
} from "../auth/middlewares.js";
import { dotenvConfig } from "../config/config.js";

const router = express.Router();
const tokenSecret = dotenvConfig.tokenSecret;

router.post(
    "/register",

    passport.authenticate("register", {
        successRedirect: "/login",
        failureRedirect: "/register",
    })
);

router.post("/login", async (req, res, next) => {
    passport.authenticate("login", async (err, user, info) => {
        try {
            if (err || !user) {
                const error = new Error("new error");
                return next(error);
            }

            req.login(user, { session: false }, async (err) => {
                if (err) return next(err);

                const body = await new UserDTO(user);

                const token = await jwt.sign({ user: body }, tokenSecret, {
                    expiresIn: "1h",
                });

                res.cookie("token", token);

                res.redirect("/profile");
            });
        } catch (e) {
            return next(e);
        }
    })(req, res, next);
});

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
