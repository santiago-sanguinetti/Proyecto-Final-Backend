import passport from "passport";
import jwt from "jsonwebtoken";
import UserDTO from "../dao/DTOs/user.dto.js";
import { dotenvConfig } from "../config/config.js";
const tokenSecret = dotenvConfig.tokenSecret;

export const isAuthenticated = passport.authenticate("jwt", { session: false });

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

export const authenticate = async (req, res, next) => {
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
};
