import path from "path";
import express from "express";
import session from "express-session";
import exphbs from "express-handlebars";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import __dirname from "./utils.js";
import productRouter from "./routes/products.router.js";
import cartRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import chatRouter from "./routes/messages.router.js";
import sessionRouter from "./routes/sessions.router.js";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import { dotenvConfig } from "./config/dotenv.config.js";
import { isAuthenticated, hasRole } from "./auth/middlewares.js";
import cookieParser from "cookie-parser";
import mockingRouter from "./routes/mocking.router.js";
import compression from "express-compression";
import errorHandler from "./services/errors/middlewares.js";
import { logger, addLogger } from "./config/logger.config.js";
import loggerRouter from "./routes/logger.router.js";
import { swaggerOptions } from "./config/swagger.config.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";

const app = express();
app.use(cookieParser());
app.use(
    session({
        secret: dotenvConfig.sessionSecret,
        resave: false,
        saveUninitialized: true,
    })
);

app.use(compression());

app.use(addLogger);

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

//Config socket.io
const server = http.createServer(app);
const io = new Server(server);
const PORT = dotenvConfig.port;

server.listen(PORT, () => {
    logger.info(`El servidor está escuchando en el puerto ${PORT}`);
});
export const socket = io.on("connection", (socket) => {
    logger.info(`Un cliente se ha conectado`);
});

//Config Swagger
const specs = swaggerJSDoc(swaggerOptions);
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

//Config Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

//Config handlebars
app.set("views", path.join(__dirname, "views"));
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

//Config Mongo
const dbURI = `mongodb+srv://${dotenvConfig.dbUser}:${dotenvConfig.dbPassword}@${dotenvConfig.dbHost}?${dotenvConfig.dbParams}`;

mongoose
    .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => logger.info(`Conectado a la base de datos`))
    .catch((err) => logger.error(err));

//Config rutas
app.use("/", viewsRouter);
app.use("/mockingproducts", mockingRouter);
app.use("/loggerTest", loggerRouter);
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/chat", isAuthenticated, hasRole("user"), chatRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/users", sessionRouter);

//Endpoints para testear autorización
app.get("/protected", isAuthenticated, (req, res) => {
    res.json({ msg: "OK - Ruta protegida" });
});
app.get("/admin", isAuthenticated, hasRole("admin"), (req, res) => {
    res.json({ msg: "OK - Ruta solo para administradores" });
});
app.get("/user", isAuthenticated, hasRole("user"), (req, res) => {
    res.json({ msg: "OK - Ruta solo para usuarios" });
});

app.use(errorHandler); // Debería ir siempre al final
