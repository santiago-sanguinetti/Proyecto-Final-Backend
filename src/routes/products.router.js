import express from "express";
import {
    createProduct,
    deleteProductById,
    getAllProducts,
    getProductById,
    updateProduct,
} from "../controllers/products.controller.js";
import { hasRole, isAuthenticated } from "../auth/middlewares.js";

const router = express.Router();

//Mostrar todos los productos,
router.get("/", getAllProducts);
//Buscar un producto por id
router.get("/:pid", getProductById);
//Crear un producto
router.post("/", isAuthenticated, hasRole("premium"), createProduct);
//Actualizar un producto
router.put("/:pid", isAuthenticated, hasRole("admin"), updateProduct);
//Eliminar un producto
router.delete(
    "/:pid",
    isAuthenticated,
    hasRole("premium", "admin"),
    deleteProductById
);

export default router;
