import { cartModel } from "../models/carts.model.js";

export default class Carts {
    constructor() {}

    getAll = async () => {
        const carts = await cartModel.find();
        return carts.map((cart) => cart.toObject());
    };

    saveCarts = async (cart) => {
        try {
            return await cartModel.create(cart);
        } catch (error) {
            throw error;
        }
    };

    getBy = async (params) => {
        return await cartModel.findOne(params).lean();
    };
}
