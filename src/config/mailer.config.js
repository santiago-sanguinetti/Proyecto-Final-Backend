import nodemailer from "nodemailer";
import { dotenvConfig } from "./dotenv.config.js";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
        user: dotenvConfig.mailUser,
        pass: dotenvConfig.mailPass,
    },
});
