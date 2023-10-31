import express from "express";
import {
    createProduct,
    deleteProductById,
    getAllProducts,
    getProductById,
    updateProduct,
} from "../controllers/products.controller.js";
import { isAdmin, isAuthenticated } from "../auth/middlewares.js";

const router = express.Router();

//Mostrar todos los productos,
router.get("/", getAllProducts);
//Buscar un producto por id
router.get("/:pid", getProductById);
//Crear un producto
router.post("/", createProduct);
//Actualizar un producto
router.put("/:pid", isAuthenticated, isAdmin, updateProduct);
//Eliminar un producto
router.delete("/:pid", isAuthenticated, isAdmin, deleteProductById);

export default router;
