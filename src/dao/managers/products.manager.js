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
        return await productModel.findOne(params).lean();
    };

    deleteById = async (id) => {
        return await productModel.deleteOne({ _id: id });
    };
}
