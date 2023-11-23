import userManager from "../dao/managers/users.manager.js";
import { generateCode } from "../utils.js";
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enums.js";
import {
    invalidEmailError,
    notFoundInDB,
    saveResetTokenError,
} from "../services/errors/info.js";
import { sendRecoveryMail } from "../services/mailer.js";
import bcrypt from "bcrypt";

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
