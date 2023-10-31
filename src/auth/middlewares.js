import passport from "passport";
import jwt from "jsonwebtoken";
import { dotenvConfig } from "../config/config.js";

export const isAuthenticated = passport.authenticate("jwt", { session: false });

//No funciona
export const isTokenValid = () => {
    try {
        const token = "token";
        const secretKey = "top_secret";

        const decoded = jwt.verify(token, secretKey);

        console.log(
            "El token es válido y su contenido decodificado es:",
            decoded
        );
    } catch (err) {
        console.log("El token no es válido:", err.message);
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).send({ message: "Requiere rol de administrador" });
    }
};

export const isUser = (req, res, next) => {
    if (req.user && req.user.role === "usuario") {
        next();
    } else {
        res.status(403).send({ message: "Requiere rol de usuario" });
    }
};

export const isNotLoggedIn = (req, res, next) => {
    console.log("isNotLoggedIn", req.isAuthenticated);
    if (req.isAuthenticated) {
        res.redirect("/profile");
    } else {
        next();
    }
};
