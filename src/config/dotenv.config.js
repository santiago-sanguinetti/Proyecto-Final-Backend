import dotenv from "dotenv";

dotenv.config();

export const dotenvConfig = {
    sessionSecret: process.env.SESSION_SECRET,
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
    port: process.env.PORT,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbHost: process.env.DB_HOST,
    dbParams: process.env.DB_PARAMS,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    githubCallbackUrl: process.env.GITHUB_CALLBACK_URL,
    tokenSecret: process.env.TOKEN_SECRET,
    loggerLevel: process.env.LOGGER_LEVEL,
};
