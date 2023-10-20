import express from "express";
import { checkAuth, checkNotAuth } from "./views.router.js";
import passport from "passport";
import { validateLogin } from "../controllers/sessions.controller.js";

const router = express.Router();

router.post(
    "/register",
    checkNotAuth,
    passport.authenticate("register", {
        successRedirect: "/login",
        failureRedirect: "/register",
    })
);

router.post(
    "/login",
    checkNotAuth,
    passport.authenticate("login", {
        failureRedirect: "/login",
    }),
    validateLogin
);

router.post("/logout", checkAuth, (req, res) => {
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

router.get("/current", async (req, res) => {
    console.log(req.session.user);
    res.send(req.session.user);
});

export default router;
