import express from "express";
import { checkAuth, checkNotAuth } from "./views.router.js";
import passport from "passport";
import { adminUser } from "../config/admin.config.js";

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
    async (req, res) => {
        if (!req.user)
            return res
                .status(400)
                .send({ status: "error", error: "Invalid credentials" });
        req.user.email === adminUser.email
            ? (req.session.user = adminUser)
            : (req.session.user = {
                  first_name: req.user.first_name,
                  last_name: req.user.last_name,
                  age: req.user.age,
                  email: req.user.email,
                  role: req.user.role,
                  cart: req.user.cart,
              });
        res.redirect("/profile");
    }
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
