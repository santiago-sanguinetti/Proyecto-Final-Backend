import { ticketModel } from "../models/ticket.model.js";

export default class Tickets {
    constructor() {}

    getAll = async () => {
        const tickets = await ticketModel.find();
        return tickets.map((tickets) => tickets.toObject());
    };

    createTicket = async (ticket) => {
        try {
            return await ticketModel.create(ticket);
        } catch (error) {
            throw error;
        }
    };

    getBy = async (params) => {
        return await ticketModel.findOne(params).lean();
    };

    deleteById = async (id) => {
        return await ticketModel.deleteOne({ _id: id });
    };

    createPurchaseTicket = async (purchaseDetails) => {
        try {
            const ticket = {
                code: purchaseDetails.code, // Asume que tienes una función para generar un código único
                purchase_datetime: new Date(),
                amount: purchaseDetails.amount,
                purchaser: purchaseDetails.purchaser,
            };

            const newTicket = await this.createTicket(ticket);
            return newTicket;
        } catch (error) {
            throw error;
        }
    };
}
