import mongoose from "mongoose";

const productCollection = "products"; // así se llamará la colección

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    status: Boolean,
    stock: Number,
    category: { type: String, required: true },
    thumbnails: Array,
});

export const productModel = mongoose.model(productCollection, productSchema);
