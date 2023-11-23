import passport from "passport";
import jwt from "jsonwebtoken";
import UserDTO from "../dao/DTOs/user.dto.js";
import { dotenvConfig } from "../config/dotenv.config.js";
import CustomError from "../services/errors/CustomError.js";
import { passportAuthenticateError } from "../services/errors/info.js";
import EErrors from "../services/errors/enums.js";
import { logger } from "../config/logger.config.js";
const tokenSecret = dotenvConfig.tokenSecret;

export const isAuthenticated = passport.authenticate("jwt", { session: false });

export const isAdmin = (req, res, next) => {
    logger.info("Verificando si el usuario es administrador");
    if (req.user && req.user.role === "admin") {
        logger.info("Usuario es administrador");
        next();
    } else {
        logger.warning("Usuario no es administrador");
        res.status(403).send({ message: "Requiere rol de administrador" });
    }
};

export const isUser = (req, res, next) => {
    logger.info("Verificando si el usuario es un usuario normal");
    if (req.user && req.user.role === "usuario") {
        logger.info("Usuario es un usuario normal");
        next();
    } else {
        logger.warning("Usuario no es un usuario normal");
        res.status(403).send({ message: "Requiere rol de usuario" });
    }
};

export const isNotLoggedIn = (req, res, next) => {
    logger.info("Verificando si el usuario no está logueado");
    if (req.isAuthenticated) {
        logger.warning("Usuario ya está logueado");
        res.redirect("/profile");
    } else {
        logger.info("Usuario no está logueado");
        next();
    }
};

export const authenticate = async (req, res, next) => {
    logger.info("Autenticando al usuario");
    passport.authenticate("login", async (err, user, info) => {
        try {
            if (err || !user) {
                logger.error(`Error al autenticar al usuario: ${err}`);
                const error = CustomError.createError({
                    name: "Error de autenticación",
                    cause: passportAuthenticateError(info),
                    message: "No se pudo autenticar el usuario",
                    code: EErrors.AUTHENTICATION_ERROR,
                });
                return next(error);
            }

            req.login(user, { session: false }, async (err) => {
                if (err) {
                    logger.error(`Error al iniciar sesión: ${err}`);
                    return next(err);
                }

                const body = await new UserDTO(user);

                const token = await jwt.sign({ user: body }, tokenSecret, {
                    expiresIn: "1h",
                });

                res.cookie("token", token);

                logger.info("Usuario autenticado exitosamente");
                res.redirect("/profile");
            });
        } catch (err) {
            logger.fatal(`Error fatal: ${err}`);
            return next(err);
        }
    })(req, res, next);
};
