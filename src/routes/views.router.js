import { Router } from "express";
import { productModel } from "../dao/models/products.model.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10; // Si no se proporciona un límite, se establece un valor predeterminado
        const products = await productModel.find().limit(limit).lean();
        console.log(products);
        res.render("home", { products });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/realtimeproducts", async (req, res) => {
    try {
        const products = await productModel.find().lean();
        res.render("realTimeProducts", { products });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
