import { socket } from "../app.js";
import mongoose from "mongoose";
import productManager from "../dao/managers/products.manager.js";
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enums.js";
import {
    notFoundInDB,
    alreadyExistsInDB,
    createProductErrorInfo,
    getAllProductsErrorInfo,
    getProductByIdErrorInfo,
} from "../services/errors/info.js";
import { logger } from "../config/logger.config.js";
import { sendProductDeletionEmail } from "../services/mailer.js";
import userManager from "../dao/managers/users.manager.js";

const usersManager = new userManager();
const productsManager = new productManager();
// Mostrar todos los productos
export const getAllApiProducts = async (req, res, next) => {
    logger.info("Obteniendo todos los productos de la API");
    const limit = Number(req.query.limit) || 10; // Si no se proporciona un límite, se establece un valor predeterminado
    const page = Number(req.query.page) || 1;
    const sort = req.query.sort || "desc";
    const query = req.query.query;

    // Valida los parámetros que podrían generar un error
    if (
        isNaN(limit) ||
        limit < 0 ||
        isNaN(page) ||
        page < 0 ||
        typeof sort !== "string" ||
        (sort !== "asc" && sort !== "desc") ||
        (query && typeof query !== "string")
    ) {
        const error = CustomError.createError({
            name: "Parámetros inválidos",
            cause: getAllProductsErrorInfo({ limit, page, sort, query }),
            message: "Error tratando de obtener los productos",
            code: EErrors.INVALID_TYPES_ERROR,
        });
        logger.error(
            `Error al obtener los productos de la API: ${error.message}`
        );
        return next(error);
    }

    try {
        const sortObject = buildSortObject(sort);
        const queryObject = buildQueryObject(query);

        const products = await productsManager.limitGetAll(
            limit,
            page,
            sortObject
        );

        const totalProducts = await productsManager.countDocuments(queryObject);
        const totalPages = Math.ceil(totalProducts / limit);
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
        logger.info("Productos obtenidos exitosamente");
        res.json(responseObject);
    } catch (err) {
        logger.error(
            `Error al obtener los productos de la API: ${err.message}`
        );
        return next(err);
    }
};
export const getAllProducts = async (req, res, next) => {
    logger.info("Obteniendo todos los productos");
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    if (
        // Valida los parámetros que podrían generar un error
        isNaN(limit) ||
        limit < 0 ||
        isNaN(page) ||
        page < 0
    ) {
        const error = CustomError.createError({
            name: "Parámetros inválidos",
            cause: getAllProductsErrorInfo({
                limit,
                page,
                sort: "N/A",
                query: "N/A",
            }),
            message: "Error tratando de obtener los productos",
            code: EErrors.INVALID_TYPES_ERROR,
        });
        logger.error(`Error al obtener los productos: ${error.message}`);
        return next(error);
    }

    try {
        const products = await productsManager.limitGetAll(limit, page);

        const totalProducts = await productsManager.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);
        const prevPage = page > 1 ? page - 1 : null;
        const nextPage = page < totalPages ? page + 1 : null;
        logger.info("Productos obtenidos exitosamente");
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
                ? `/products?page=${prevPage}&limit=${limit}`
                : null,
            nextLink: nextPage
                ? `/products?page=${nextPage}&limit=${limit}`
                : null,
        });
    } catch (err) {
        logger.error(`Error al obtener los productos: ${err.message}`);
        return next(err);
    }
};

// Buscar un producto por id
export const getProductById = async (req, res, next) => {
    logger.info("Obteniendo un producto por ID");
    try {
        const products = new Array();
        const id = req.params.pid;

        if (!isValidObjectId(id)) {
            const error = CustomError.createError({
                name: "Parámetros inválidos",
                cause: getProductByIdErrorInfo(id),
                message: "Error tratando de obtener el producto",
                code: EErrors.INVALID_TYPES_ERROR,
            });
            logger.error(`Error al obtener el producto: ${error.cause}`);
            return next(error);
        }

        const product = await productsManager.getBy({ _id: id });
        products.push(product);

        if (product == null) {
            const error = CustomError.createError({
                name: "La base de datos devolvió null",
                cause: getProductByIdErrorInfo(),
                message: "Error tratando de obtener el producto",
                code: EErrors.DATABASE_ERROR,
            });
            logger.error(`Error al obtener el producto: ${error.cause}`);
            return next(error);
        }
        logger.info("Producto obtenido exitosamente");
        // res.render("home", { products });
        res.json(products);
    } catch (err) {
        logger.error(`Error al obtener el producto: ${err.message}`);
        return next(err);
    }
};
// Crear un producto
export const createProduct = async (req, res, next) => {
    logger.info("Creando un producto");
    try {
        let productOwner = "admin";
        if (req.user && req.user.role === "premium")
            productOwner = req.user._id;
        const product = {
            title: req.body.title,
            description: req.body.description,
            code: req.body.code,
            price: req.body.price,
            status: req.body.status ?? true,
            stock: req.body.stock,
            category: req.body.category,
            thumbnails: req.body.thumbnails ?? [],
            owner: productOwner,
        };

        const existingProduct = await productsManager.getBy({
            code: product.code,
        });
        if (existingProduct) {
            const error = CustomError.createError({
                name: "Producto ya existe",
                cause: alreadyExistsInDB("producto"),
                message: "El código del producto ya está en uso",
                code: EErrors.DATABASE_ERROR,
            });
            logger.error(`Error al crear el producto: ${error.cause}`);
            return next(error);
        } else {
            const errorCause = validateProduct(product);
            if (errorCause) {
                const error = CustomError.createError({
                    name: "Producto inválido",
                    cause: errorCause,
                    message: "Los parámetros son inválidos",
                    code: EErrors.INVALID_TYPES_ERROR,
                });
                logger.error(`Error al crear el producto: ${error.cause}`);
                return next(error);
            }
            const createProduct = await productsManager.createProduct(product);

            try {
                const newProduct = await productsManager.saveProduct(
                    createProduct
                );

                //Emite un evento "product-created" cada vez que se crea un producto
                socket.emit("product-created", newProduct);
                logger.info("Producto creado exitosamente");
                res.status(201).json(newProduct);
            } catch (err) {
                logger.error(`Error al crear el producto: ${err.cause}`);
                return next(err);
            }
        }
    } catch (err) {
        logger.error(`Error al crear el producto: ${err.message}`);
        return next(err);
    }
};

// Actualizar un producto
export const updateProduct = async (req, res, next) => {
    logger.info("Actualizando un producto");
    try {
        const product = await productsManager.getBy({ _id: req.params.pid });
        if (product == null) {
            const error = CustomError.createError({
                name: "Producto no encontrado",
                cause: notFoundInDB("producto"),
                message: "No se pudo encontrar el producto",
                code: EErrors.DATABASE_ERROR,
            });
            logger.error(`Error al actualizar el producto: ${error.cause}`);
            return next(error);
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

        const errorCause = validateProduct(product);
        if (errorCause) {
            const error = CustomError.createError({
                name: "Producto inválido",
                cause: errorCause,
                message: "Los parámetros son inválidos",
                code: EErrors.INVALID_TYPES_ERROR,
            });
            logger.error(`Error al actualizar el producto: ${error.cause}`);
            return next(error);
        }

        const updatedProduct = await productsManager.saveProduct(product);
        logger.info("Producto actualizado exitosamente");
        res.json(updatedProduct);
    } catch (err) {
        logger.error(`Error al actualizar el producto: ${err.message}`);
        return next(err);
    }
};
// Eliminar un producto
export const deleteProductById = async (req, res, next) => {
    logger.info("Eliminando un producto");
    try {
        const product = await productsManager.getBy({ _id: req.params.pid });
        if (product == null) {
            const error = CustomError.createError({
                name: "Producto no encontrado",
                cause: notFoundInDB("producto"),
                message: "No se pudo encontrar el producto",
                code: EErrors.DATABASE_ERROR,
            });
            logger.error(`Error al eliminar el producto: ${error.cause}`);
            return next(error);
        }

        let userId = req.user._id;
        if (userId) userId = userId.toString();
        const userIsOwner = product.owner === userId;

        if (product.owner !== "admin") req.productOwner = product.owner;

        if (userIsOwner || req.user.role === "admin") {
            await productsManager.deleteById(req.params.pid);

            // Emite un evento 'product-deleted' cada vez que se elimina un producto
            socket.emit("product-deleted", req.params.pid);

            logger.info("Producto eliminado exitosamente");
            res.status(200);
            return next();
        } else {
            logger.info(
                "No se tienen los permisos necesarios para borrar un producto"
            );
            res.json({
                message: "No tiene permisos para realizar esta acción",
            });
        }
    } catch (err) {
        logger.error(`Error al eliminar el producto: ${err.message}`);
        return next(err);
    }
};

export const emailProductOwner = async (req, res, next) => {
    try {
        if (!req.productOwner) {
            return next();
        }
        const userOwner = await usersManager.getBy({ _id: req.productOwner });

        sendProductDeletionEmail(userOwner.email);

        res.status(200).send(
            "Email enviado con éxito! El producto se ha eliminado."
        );
    } catch (error) {
        return next(error);
    }
};

// Función auxiliar para construir el objeto sortObject
const buildSortObject = (sort) => {
    logger.debug("Construyendo objeto de ordenamiento");
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
    logger.debug("Construyendo objeto de consulta");
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
    logger.debug("Construyendo objeto de respuesta");
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

// Función auxiliar para validar los datos de un producto
export const validateProduct = (product) => {
    logger.debug("Validando producto");
    const expectedTypes = {
        title: "string",
        description: "string",
        code: "string",
        price: "number",
        status: "boolean",
        stock: "number",
        category: "string",
        thumbnails: "array",
    };

    const requiredFields = [
        "title",
        "description",
        "code",
        "price",
        "category",
    ];

    for (const [key, type] of Object.entries(expectedTypes)) {
        if (
            type === "array"
                ? !Array.isArray(product[key])
                : typeof product[key] !== type
        ) {
            logger.debug(
                `Error al validar el producto: el campo ${key} no es del tipo esperado`
            );
            return createProductErrorInfo(product);
        }
    }

    for (const field of requiredFields) {
        if (!product[field]) {
            logger.debug(
                `Error al validar el producto: el campo ${field} es requerido`
            );
            return createProductErrorInfo(product);
        }
    }
    // Si todos los campos son válidos, devuelve null
    return null;
};

// Función auxiliar para validar si un id de mongo es válido
export const isValidObjectId = (id) => {
    logger.debug("Validando ID de objeto");
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
        logger.debug(
            `Error al validar ID de objeto: ${id} no es un ID de MongoDB válido`
        );
    }
    return isValid;
};
