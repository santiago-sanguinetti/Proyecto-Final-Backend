import mongoose from "mongoose";

const ticketCollection = "tickets";

const ticketSchema = new mongoose.Schema({
    code: { type: String, unique: true, required: true }, //Autogenerado
    purchase_datetime: { type: Date, required: true }, //Fecha y hora de la compra (created_at)
    amount: { type: Number, required: true }, //Total de la compra
    purchaser: { type: String, required: true }, //Correo del usuario
});

export const ticketModel = mongoose.model(ticketCollection, ticketSchema);
