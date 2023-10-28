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
}
