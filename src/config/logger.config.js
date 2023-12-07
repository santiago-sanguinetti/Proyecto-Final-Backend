import winston from "winston";
import path from "path";
import __dirname from "../utils.js";
import { dotenvConfig } from "./dotenv.config.js";

const customLevelOptions = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5,
    },
    colors: {
        fatal: "red",
        error: "magenta",
        warning: "yellow",
        info: "blue",
        http: "green",
        debug: "grey",
    },
};

const prettyJson = winston.format.printf((info) => {
    if (info.message.constructor === Object) {
        info.message = JSON.stringify(info.message, null, 4);
    }
    return `${info.level}: ${info.message}`;
});

const errorLogPath = path.join(__dirname, "./services/errors/errors.log");

const consoleFormat = winston.format.combine(
    winston.format.colorize({ colors: customLevelOptions.colors }),
    winston.format.printf(({ level, message }) => {
        return `[${new Date().toLocaleTimeString()}] ${level}: ${message}`;
    }),
    prettyJson
);

const fileFormat = winston.format.printf(({ level, message }) => {
    return `[${new Date().toLocaleString()}] ${level}: ${message}`;
});

export const logger = winston.createLogger({
    levels: customLevelOptions.levels,
    transports: [
        new winston.transports.Console({
            level: dotenvConfig.loggerLevel === "dev" ? "debug" : "info",
            format: consoleFormat,
        }),
        new winston.transports.File({
            filename: errorLogPath,
            level: "error",
            format: fileFormat,
        }),
    ],
});

export const addLogger = (req, res, next) => {
    req.logger = logger;
    req.logger.http(`${req.method} en ${req.url}`);
    next();
};
