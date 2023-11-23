import { ReturnDocument } from "mongodb";
import { logger } from "../../config/logger.config.js";
import { userModel } from "../models/users.model.js";
import bcrypt from "bcrypt";

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
            logger.error(error.message);
            throw error;
        }
    };

    createPasswordResetToken = async (user) => {
        try {
            const filter = { _id: user._id };

            const update = {
                passwordResetToken: user.passwordResetToken,
                passwordResetExpires: user.passwordResetExpires,
            };

            return await userModel.updateOne(filter, update);
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    };

    updatePassword = async (user) => {
        try {
            const updatedUser = await userModel
                .findOne({ _id: user._id })
                .then(async (dbUser) => {
                    dbUser.password = await bcrypt.hash(user.password, 10);
                    dbUser.passwordResetToken = undefined;
                    dbUser.passwordResetExpires = undefined;
                    await dbUser.save();
                });

            return await updatedUser;
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    };

    getBy = async (params) => {
        return await userModel.findOne(params).lean();
    };
}
