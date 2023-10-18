import { userModel } from "../models/users.model.js";

export default class Users {
    constructor() {}

    getAll = async () => {
        const users = await userModel.find();
        return users.map((user) => user.toObject());
    };

    saveUsers = async (user) => {
        try {
            return await userModel.create(user);
        } catch (error) {
            throw error;
        }
    };

    getBy = async (params) => {
        return await userModel.findOne(params).lean();
    };
}
