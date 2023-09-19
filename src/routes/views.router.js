import { Router } from "express";
import { productModel } from "../dao/models/products.model.js";
import { cartModel } from "../dao/models/carts.model.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10; // Si no se proporciona un límite, se establece un valor predeterminado
        const products = await productModel.find().limit(limit).lean();
        res.render("home", { products });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/realtimeproducts", async (req, res) => {
    try {
        const products = await productModel.find().lean();
        console.log(products);
        res.render("realTimeProducts", { products });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/products", async (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    try {
        const products = await productModel
            .find()
            .lean()
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        const totalProducts = await productModel.countDocuments().exec();
        const totalPages = Math.ceil(totalProducts / limit);
        const prevPage = page > 1 ? page - 1 : null;
        const nextPage = page < totalPages ? page + 1 : null;

        res.render("products", {
            products: products,
            totalPages: totalPages,
            prevPage: prevPage,
            nextPage: nextPage,
            page: page,
            hasPrevPage: prevPage !== null,
            hasNextPage: nextPage !== null,
            prevLink: prevPage
                ? `/productos?page=${prevPage}&limit=${limit}`
                : null,
            nextLink: nextPage
                ? `/productos?page=${nextPage}&limit=${limit}`
                : null,
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get("/cart", async (req, res) => {
    //Por ahora funciona con un solo carrito luego funcionará con :cid
    const { cid } = req.params;
    console.log(cid);

    try {
        const cart = await cartModel
            .findById("6509ec5bdc95728198f484f9") //cid
            .populate("products")
            .lean();
        console.log(cart);
        res.render("cart", { cart: cart });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

export default router;
