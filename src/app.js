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

const app = express();
app.use(
    session({
        secret: "secretCoder",
        resave: false,
        saveUninitialized: true,
    })
);

//Config socket.io
const server = http.createServer(app);
const io = new Server(server);
const PORT = 8080;

server.listen(PORT, () => {
    console.log("El servidor está escuchando en el puerto 8080");
});
export const socket = io.on("connection", (socket) => {
    console.log("Un cliente se ha conectado.");
});

//Config Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

//Config handlebars
app.set("views", path.join(__dirname, "views"));
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

//Config Mongo
const dbURI =
    "mongodb+srv://CoderUser:00UIDh6iSAQPHj28@ecommerce.dn98uin.mongodb.net/?retryWrites=true&w=majority";

mongoose
    .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log("Conectado a la base de datos"))
    .catch((err) => console.log(err));

//Config rutas
app.use("/", viewsRouter);
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/chat", chatRouter);
app.use("/api/sessions", sessionRouter);

//Config chat
// let messages = [];
// socket.on("message", (data) => {
//     messages.push(data);
//     io.emit("messageLogs", messages);
// });
