import { transporter } from "../config/mailer.config.js";
import { dotenvConfig } from "../config/dotenv.config.js";
import { logger } from "../config/logger.config.js";

export const sendRecoveryMail = async (req, res) => {
    if (!dotenvConfig.mailUser || !dotenvConfig.mailPass) {
        logger.warning(
            `Ingrese a las variables de entorno para configurar un email y contraseña`
        );
        return res
            .status(404)
            .send(
                "Ingrese a las variables de entorno para configurar un email y contraseña"
            );
    }

    logger.info("Enviando un e-mail");
    let mail = await transporter.sendMail(
        {
            from: dotenvConfig.mailUser,
            to: req.body.email,
            subject: "Restablece tu contraseña",
            html: `
        <html>
            <head>
                <title>Restablece tu Contraseña</title>
            </head>
            <body>
                <h2>Restablecimiento de Contraseña</h2>
                <p>Hola,</p>
                <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
                <p>Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                <p><a href="http://localhost:8080/api/sessions/reset-password/${req.resetToken}">Restablecer Contraseña</a></p>
                <p>Si no has solicitado un restablecimiento de contraseña, por favor, ignora este correo electrónico.</p>
                <p>Saludos,</p>
                <p>Santiago Sanguinetti</p>
            </body>
        </html>`,
        },
        (error, info) => {
            if (error) {
                logger.error(error);
            } else {
                logger.info(`Email enviado: ${info.response}`);
            }
        }
    );
    res.status(200).send("Email enviado con éxito.");
};

export const sendAccountDeletionEmail = async (userEmail) => {
    if (!dotenvConfig.mailUser || !dotenvConfig.mailPass) {
        logger.warning(
            `Ingrese a las variables de entorno para configurar un email y contraseña`
        );
        return res
            .status(404)
            .send(
                "Ingrese a las variables de entorno para configurar un email y contraseña"
            );
    }

    logger.info("Enviando un e-mail");
    let mail = await transporter.sendMail(
        {
            from: dotenvConfig.mailUser,
            to: userEmail,
            subject: "Su cuenta ha sido eliminada",
            html: `
            <html>
            <head>
                <title>Su cuenta ha sido eliminada</title>
            </head>
            <body>
                <p>Hola,</p>
                <p>Queremos informarte que tu cuenta ha sido eliminada debido a un tiempo de inactividad prolongado.</p>
                <p>Si crees que esto es un error, por favor responde a este email.</p>
                <p></p>
                <p>Saludos,</p>
                <p>Santiago Sanguinetti</p>
            </body>
        </html>
            `,
        },
        (error, info) => {
            if (error) {
                logger.error(error);
            } else {
                logger.info(`Email enviado: ${info.response}`);
            }
        }
    );
    return;
};
