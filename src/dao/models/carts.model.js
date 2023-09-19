import mongoose from "mongoose";

const cartCollection = "carts";

const cartSchema = new mongoose.Schema({
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "products",
            },
            quantity: { type: Number, required: true },
            _id: false,
        },
    ],
});

export const cartModel = mongoose.model(cartCollection, cartSchema);
