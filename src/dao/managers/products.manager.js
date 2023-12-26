import { productModel } from "../models/products.model.js";

export default class Products {
    constructor() {}

    getAll = async () => {
        const products = await productModel.find();
        return products.map((products) => products.toObject());
    };
    createProduct = async (product) => {
        try {
            return await productModel.create(product);
        } catch (error) {
            throw error;
        }
    };
    saveProduct = async (product) => {
        try {
            return await productModel.create(product);
        } catch (error) {
            throw error;
        }
    };

    getBy = async (params) => {
        const acceptedParams = ["_id"];
        let query = {};

        try {
            for (let key in params) {
                if (acceptedParams.includes(key)) {
                    query[key] = params[key];
                }
            }

            return await productModel.findOne(params).lean();
        } catch (error) {
            throw error;
        }
    };

    deleteById = async (id) => {
        return await productModel.deleteOne({ _id: id });
    };

    countDocuments = async (queryObject) => {
        return await productModel.countDocuments(queryObject).exec();
    };

    limitGetAll = async (limit, page, sort) => {
        return await productModel
            .find()
            .lean()
            .sort(sort)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
    };

    updateProductStock = async (product, quantity) => {
        try {
            product.stock -= quantity;

            const updatedProduct = await productModel.findByIdAndUpdate(
                product._id,
                product,
                { new: true }
            );
            return updatedProduct;
        } catch (error) {
            throw error;
        }
    };
}
