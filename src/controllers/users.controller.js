import userManager from "../dao/managers/users.manager.js";
import { generateCode } from "../utils.js";
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enums.js";
import {
    invalidEmailError,
    notFoundInDB,
    saveResetTokenError,
} from "../services/errors/info.js";
import {
    sendAccountDeletionEmail,
    sendRecoveryMail,
} from "../services/mailer.js";
import bcrypt from "bcrypt";
import UserDTO from "../dao/DTOs/user.dto.js";

const usersManager = new userManager();

export const forgotPassword = async (req, res, next) => {
    req.logger.info(`Guardando token de restablecimiento de contraseña`);
    const resetToken = generateCode();
    req.logger.debug(`resetToken: ${resetToken}`);
    try {
        req.logger.debug(`email: ${req.body.email}`);
        if (!req.body.email) {
            const error = CustomError.createError({
                name: "Email no recibido",
                cause: invalidEmailError(),
                message: "No se recibió un email",
                code: EErrors.INVALID_TYPES_ERROR,
            });
            return next(error);
        }
        const user = await usersManager.getBy({ email: req.body.email });

        req.logger.debug(`user: ${user}`);
        if (!user) {
            const error = CustomError.createError({
                name: "Usuario no encontrado",
                cause: notFoundInDB("usuario"),
                message: "No existe una cuenta con ese correo electrónico",
                code: EErrors.NOT_FOUND_ERROR,
            });
            return next(error);
        }

        user.passwordResetToken = resetToken;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hora

        usersManager.createPasswordResetToken(user);

        req.resetToken = resetToken;

        sendRecoveryMail(req, res);
    } catch (err) {
        req.logger.debug(`Error en forgotPassword: ${err.message}`);
        return next(err);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const user = await usersManager.getBy({ passwordResetToken: token });

        if (!user) {
            req.logger.debug("Token inválido");
            return res.status(400).send({ message: "Token inválido" });
        }

        if (Date.now() > user.passwordResetExpires) {
            req.logger.debug("Token expirado");
            return res.send(`
                <script>
                    setTimeout(function(){
                        window.location.href = '/forgot-my-password';
                    }, 3000);
                </script>
                <p>El token ha expirado. Serás redirigido en 3 segundos...</p>
            `);
        }

        const isSamePassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (isSamePassword) {
            req.logger.debug("Misma contraseña");
            return res.status(400).send({
                message:
                    "La nueva contraseña no puede ser igual a la contraseña actual",
            });
        }

        user.password = req.body.password;
        usersManager.updatePassword(user);
        res.status(200).send("El usuario se modificó con éxito");
    } catch (err) {
        return next(err);
    }
};

export const swapUserRole = async (req, res, next) => {
    const user = await usersManager.getBy({ _id: req.params.uid });
    if (!user) {
        return res.status(404).send({ message: "Usuario no encontrado" });
    }

    // Verifica si existe al menos un documento de cada tipo requerido
    const requiredTypes = ["profile", "product", "document"];
    for (const type of requiredTypes) {
        const doc = user.documents.find((doc) => doc.name.startsWith(type));
        if (!doc) {
            return res
                .status(400)
                .send(
                    `El usuario debe cargar al menos un documento de tipo ${type} antes de poder convertirse en premium`
                );
        }
    }

    // Si todos los tipos de documentos existen, actualiza el rol del usuario
    user.role = user.role === "usuario" ? "premium" : "usuario";
    usersManager.updateRole(user);
    res.send(user);
};

export const updateUserStatus = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(404).send({ message: "Usuario no encontrado" });
        }
        usersManager.updateUserStatus(req.user);
    } catch (error) {
        return next(error);
    }
};

export const uploadDocuments = async (req, res, next) => {
    try {
        const user = await usersManager.getBy({ _id: req.params.uid });
        if (!user) {
            return res.status(404).send("Usuario no encontrado");
        }

        // Itera sobre cada archivo cargado y lo añade al array de documentos del usuario
        req.files.forEach((file) => {
            const document = {
                name: file.filename,
                reference: file.path,
            };
            user.documents.push(document);
        });

        // Guarda el usuario actualizado en la base de datos
        await usersManager.save(user);

        res.status(200).send("Documentos cargados con éxito");
    } catch (error) {
        return next(error);
    }
};

// Middleware para obtener todos los usuarios
export const getAllUsers = async (req, res, next) => {
    try {
        // Obtiene todos los usuarios
        const users = await usersManager.getAll();

        // Convierte cada usuario a un objeto y luego a una instancia de UserDTO
        const userDTOs = users.map((user) => new UserDTO(user));

        // Agrega los usuarios al req
        req.users = userDTOs;

        // Devuelve un JSON con los UserDTOs
        // res.json(userDTOs);
        next();
    } catch (error) {
        // Maneja el error
        return next(error);
    }
};

export const getAllInactiveUsersEmail = async (req, res, next) => {
    try {
        // Obtiene todos los usuarios
        const users = await usersManager.getAll();

        // Define el tiempo límite
        const cutoffTime = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); //2 días

        const innactiveUsers = [];

        for (const user of users) {
            // Si la última conexión es antes que el tiempo límite, agrega el usuario al array
            if (user.last_connection < cutoffTime)
                innactiveUsers.push(user.email);
        }
        req.innactiveUsersEmail = innactiveUsers;
        // Devuelve un JSON con los usuarios inactivos
        // res.status(200).json(innactiveUsers);
        return next();
    } catch (error) {
        return next(error);
    }
};

export const emailInactiveUsers = async (req, res, next) => {
    try {
        for (const userEmail of req.innactiveUsersEmail) {
            sendAccountDeletionEmail(userEmail);
        }

        res.status(200);
        return next();
    } catch (error) {
        return next(error);
    }
};

export const deleteAllInactiveUsers = async (req, res, next) => {
    try {
        for (const userEmail of req.innactiveUsersEmail) {
            await usersManager.deleteUserByEmail(userEmail);
        }

        res.status(200).send("Usuarios eliminados con éxito.");
    } catch (error) {
        return next(error);
    }
};

export const updateRole = async (req, res, next) => {
    try {
        console.log("###params uid", req.params.uid);
        const user = await usersManager.getBy({ _id: req.params.uid });
        if (!user) {
            return res.status(404).send({ message: "Usuario no encontrado" });
        }

        user.role = req.body.role;
        usersManager.updateRole(user);

        res.status(200).redirect("/adminview");
    } catch (error) {
        return next(error);
    }
};
