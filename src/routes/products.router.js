import express from "express";
import {
    createProduct,
    deleteProductById,
    getAllApiProducts,
    getProductById,
    updateProduct,
} from "../controllers/products.controller.js";
import { hasRole, verifyToken } from "../auth/middlewares.js";

const router = express.Router();

//Mostrar todos los productos,
router.get("/", getAllApiProducts);
//Buscar un producto por id
router.get("/:pid", getProductById);
//Crear un producto
router.post("/", verifyToken, hasRole("premium", "admin"), createProduct);
//Actualizar un producto
router.put("/:pid", verifyToken, hasRole("admin"), updateProduct);
//Eliminar un producto
router.delete(
    "/:pid",
    verifyToken,
    hasRole("premium", "admin"),
    deleteProductById
);

export default router;
