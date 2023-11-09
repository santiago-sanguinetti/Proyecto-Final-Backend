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
        error: "orange",
        warning: "yellow",
        info: "blue",
        debug: "white",
    },
};

const errorLogPath = path.join(__dirname, "./services/errors/errors.log");

const logFormat = winston.format.combine(
    winston.format.colorize({ colors: customLevelOptions.colors }),
    winston.format.printf(({ level, message }) => {
        return `[${new Date().toLocaleTimeString()}] ${level}: ${message}`;
    })
);

const devLogger = winston.createLogger({
    levels: customLevelOptions.levels,
    format: logFormat,
    transports: [
        new winston.transports.Console({ level: "debug" }),
        new winston.transports.File({ filename: errorLogPath, level: "error" }),
    ],
});

const prodLogger = winston.createLogger({
    levels: customLevelOptions.levels,
    format: logFormat,
    transports: [
        new winston.transports.Console({ level: "info" }),
        new winston.transports.File({ filename: errorLogPath, level: "error" }),
    ],
});

export const addLogger = (req, res, next) => {
    req.logger = logger;
    req.logger.http(
        `${req.method} en ${req.url} - ${new Date().toLocaleTimeString()}`
    );
    next();
};

export const logger =
    dotenvConfig.loggerLevel === "dev" ? devLogger : prodLogger;
