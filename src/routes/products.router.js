import express from "express";
import mongoose from "mongoose";
import { productModel } from "../dao/models/products.model.js";
import { socket } from "../app.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const limit = parseInt(req.query.limit) || 10; // Si no se proporciona un límite, se establece un valor predeterminado
    const page = Number(req.query.page) || 1;
    const sort = req.query.sort;
    const query = req.query.query;

    let sortObject = {};
    if (sort === "asc") {
        sortObject.price = 1;
    } else if (sort === "desc") {
        sortObject.price = -1;
    }

    let queryObject = {};

    if (query) {
        queryObject.$or = [
            { category: { $regex: query, $options: "i" } },
            { status: { $regex: query, $options: "i" } },
        ];
    }

    try {
        const products = await productModel
            .find()
            .lean()
            .sort(sortObject)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        const totalProducts = await productModel
            .countDocuments(queryObject)
            .exec();
        const totalPages = Math.ceil(totalProducts / limit);
        const prevPage = page > 1 ? page - 1 : null;
        const nextPage = page < totalPages ? page + 1 : null;

        res.json({
            status: "success",
            payload: products,
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
        // console.log(products);
        // res.render("home", { products });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/:pid", async (req, res) => {
    try {
        const products = new Array();
        const product = await productModel.findById(req.params.pid).lean();
        products.push(product);
        if (product == null) {
            return res
                .status(404)
                .json({ message: "No se pudo encontrar el producto" });
        }
        res.render("home", { products });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.post("/", async (req, res) => {
    const product = new productModel({
        title: req.body.title,
        description: req.body.description,
        code: req.body.code,
        price: req.body.price,
        status: req.body.status ?? true,
        stock: req.body.stock,
        category: req.body.category,
        thumbnails: req.body.thumbnails ?? [],
    });

    try {
        const newProduct = await product.save();

        //Emite un evento "product-created" cada vez que se crea un producto
        socket.emit("product-created", newProduct);

        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put("/:pid", async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid);
        if (product == null) {
            return res
                .status(404)
                .json({ message: "No se pudo encontrar el producto" });
        }

        // Define los campos que pueden ser actualizados
        const fieldsToUpdate = [
            "title",
            "description",
            "code",
            "price",
            "status",
            "stock",
            "category",
            "thumbnails",
        ];

        // Itera sobre los campos y actualiza los valores si están presentes en la solicitud
        fieldsToUpdate.forEach((field) => {
            if (req.body[field] != null) {
                product[field] = req.body[field];
            }
        });

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.delete("/:pid", async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid);
        if (product == null) {
            return res
                .status(404)
                .json({ message: "No se pudo encontrar el producto" });
        }

        await product.deleteOne();

        // Emite un evento 'product-deleted' cada vez que se elimina un producto
        socket.emit("product-deleted", req.params.pid);

        res.json({ message: "Producto eliminado" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

export default router;
