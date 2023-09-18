import mongoose from "mongoose";

const msgCollection = "messages";

const msgSchema = new mongoose.Schema({
    user: String,
    msg: {
        type: String,
        required: true,
    },
});

export const msgModel = mongoose.model(msgCollection, msgSchema);
