import { cartModel } from "../models/carts.model.js";

export default class Carts {
    constructor() {}

    getAll = async () => {
        const carts = await cartModel.find();
        return carts.map((cart) => cart.toObject());
    };

    createCart = async (cart) => {
        try {
            return await cartModel.create(cart);
        } catch (error) {
            throw error;
        }
    };

    saveCart = async (cart) => {
        try {
            return await cart.save();
        } catch (error) {
            throw error;
        }
    };

    getBy = async (params) => {
        return await cartModel.findOne(params); //lean() para convertirlo en object de js
    };

    populateProducts = async (cart) => {
        try {
            return await cart.populate("products");
        } catch (error) {
            throw error;
        }
    };
}
