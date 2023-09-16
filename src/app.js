import path from "path";
import express from "express";
import exphbs from "express-handlebars";
import mongoose from "mongoose";
import __dirname from "./utils.js";
import productRouter from "./routes/products.router.js";

const app = express();
const PORT = 8080;

//Config Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

//Config handlebars
app.set("views", path.join(__dirname, "views"));
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

const server = app.listen(PORT, () => {
    console.log("Server ON");
});

//Config Mongo
const dbURI =
    "mongodb+srv://CoderUser:00UIDh6iSAQPHj28@ecommerce.dn98uin.mongodb.net/?retryWrites=true&w=majority";

mongoose
    .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log("Conectado a la base de datos"))
    .catch((err) => console.log(err));

//Config rutas
app.use("/api/products", productRouter);
