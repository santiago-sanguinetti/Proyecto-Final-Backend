import { socket } from "../app.js";
import productManager from "../dao/managers/products.manager.js";

const productsManager = new productManager();
// Mostrar todos los productos
export const getAllApiProducts = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10; // Si no se proporciona un límite, se establece un valor predeterminado
    const page = Number(req.query.page) || 1;
    const sort = req.query.sort;
    const query = req.query.query;

    const sortObject = buildSortObject(sort);
    const queryObject = buildQueryObject(query);

    try {
        const products = await productsManager.limitGetAll(
            limit,
            page,
            sortObject
        );

        const totalProducts = await productsManager.countDocuments(queryObject);
        const prevPage = page > 1 ? page - 1 : null;
        const nextPage = page < totalPages ? page + 1 : null;

        const responseObject = buildResponseObject(
            products,
            totalProducts,
            limit,
            page,
            prevPage,
            nextPage
        );

        res.json(responseObject);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const getAllProducts = async (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    try {
        const products = await productsManager.limitGetAll(limit, page);

        const totalProducts = await productsManager.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);
        const prevPage = page > 1 ? page - 1 : null;
        const nextPage = page < totalPages ? page + 1 : null;
        res.render("products", {
            user: req.session.user,
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
};

// Buscar un producto por id
export const getProductById = async (req, res) => {
    try {
        const products = new Array();
        const product = await productsManager.getBy({ _id: req.params.pid });
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
};
// Crear un producto
export const createProduct = async (req, res) => {
    const product = await productsManager.createProduct({
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
        const newProduct = await productsManager.saveProduct(product);

        //Emite un evento "product-created" cada vez que se crea un producto
        socket.emit("product-created", newProduct);

        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
// Actualizar un producto
export const updateProduct = async (req, res) => {
    try {
        const product = await productsManager.getBy({ _id: req.params.pid });
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

        const updatedProduct = await productsManager.saveProduct(product);
        res.json(updatedProduct);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
// Eliminar un producto
export const deleteProductById = async (req, res) => {
    try {
        const product = await productsManager.getBy({ _id: req.params.pid });
        if (product == null) {
            return res
                .status(404)
                .json({ message: "No se pudo encontrar el producto" });
        }

        await productsManager.deleteById(req.params.id);

        // Emite un evento 'product-deleted' cada vez que se elimina un producto
        socket.emit("product-deleted", req.params.pid);

        res.json({ message: "Producto eliminado" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Función auxiliar para construir el objeto sortObject
const buildSortObject = (sort) => {
    let sortObject = {};
    if (sort === "asc") {
        sortObject.price = 1;
    } else if (sort === "desc") {
        sortObject.price = -1;
    }
    return sortObject;
};

// Función auxiliar para construir el objeto queryObject
const buildQueryObject = (query) => {
    let queryObject = {};
    if (query) {
        queryObject.$or = [
            { category: { $regex: query, $options: "i" } },
            { status: { $regex: query, $options: "i" } },
        ];
    }
    return queryObject;
};

// Función auxiliar para construir el objeto de respuesta
const buildResponseObject = (
    products,
    totalProducts,
    limit,
    page,
    prevPage,
    nextPage
) => {
    return {
        status: "success",
        payload: products,
        totalPages: Math.ceil(totalProducts / limit),
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
    };
};
