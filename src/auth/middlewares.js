import passport from "passport";
import jwt from "jsonwebtoken";
import UserDTO from "../dao/DTOs/user.dto.js";
import { dotenvConfig } from "../config/dotenv.config.js";
import CustomError from "../services/errors/CustomError.js";
import {
    tokenNotReceived,
    invalidToken,
    passportAuthenticateError,
} from "../services/errors/info.js";
import EErrors from "../services/errors/enums.js";
import { logger } from "../config/logger.config.js";
import userManager from "../dao/managers/users.manager.js";
const tokenSecret = dotenvConfig.tokenSecret;

const usersManager = new userManager();

export const verifyToken = (req, res, next) => {
    logger.info("Verificando el token del usuario");
    const authHeader = req.header("Authorization");
    let authCookie = "";

    if (req.cookies.token) authCookie = req.cookies.token;

    if (!authHeader && !authCookie) {
        const error = CustomError.createError({
            name: "Acceso denegado",
            cause: tokenNotReceived(),
            message: "Acceso denegado, se requiere token",
            code: EErrors.AUTHENTICATION_ERROR,
        });
        logger.error(`Error al verificar el token: ${error.message}`);
        return next(error);
    }

    let token = authCookie;
    if (authHeader) token = authHeader.split(" ")[1];

    if (!token) {
        const error = CustomError.createError({
            name: "Acceso denegado",
            cause: tokenNotReceived(),
            message: "Acceso denegado, se requiere token",
            code: EErrors.AUTHENTICATION_ERROR,
        });
        logger.error(`Error al verificar el token: ${error.message}`);
        return next(error);
    }

    jwt.verify(token, tokenSecret, (err, credentials) => {
        if (err) {
            const error = CustomError.createError({
                name: "Token no válido",
                cause: invalidToken(),
                message: "Token no válido",
                code: EErrors.AUTHENTICATION_ERROR,
            });
            logger.error(`Error al verificar el token: ${error.message}`);
            return next(error);
        }

        req.user = credentials.user;
        logger.info("Token verificado con éxito");
        next();
    });
};

export const hasRole = (...roles) => {
    return (req, res, next) => {
        logger.info(
            `Verificando si el usuario tiene uno de los siguientes roles: ${roles.join(
                ", "
            )}`
        );
        if (req.user && roles.includes(req.user.role)) {
            logger.info(`Usuario tiene el rol ${req.user.role}`);
            next();
        } else {
            const error = CustomError.createError({
                name: "Rol no válido",
                cause: new Error(
                    "Usuario no tiene ninguno de los roles requeridos"
                ),
                message: `Requiere uno de los siguientes roles: ${roles.join(
                    ", "
                )}`,
                code: EErrors.AUTHENTICATION_ERROR,
            });
            req.logger.error(`Error al verificar el rol: ${error.message}`);
            return next(error);
        }
    };
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

                if (user.role !== "admin") {
                    usersManager.updateLastConnection(user);
                }

                logger.info("Usuario autenticado exitosamente");

                // Verifica el encabezado 'Accept' de la solicitud
                if (req.headers.accept === "application/json") {
                    // Si el cliente acepta JSON, envía una respuesta JSON
                    res.status(200).json({ token });
                } else {
                    // Si no, renderiza una vista
                    res.cookie("token", token, { httpOnly: true });
                    res.render("profile", { user: body });
                }
            });
        } catch (err) {
            logger.error(`Error: ${err}`);
            return next(err);
        }
    })(req, res, next);
};
