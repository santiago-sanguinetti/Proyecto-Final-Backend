import express from "express";
import { msgModel } from "../dao/models/messages.model.js";
import { socket } from "../app.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const message = new msgModel({
        user: req.body.user,
        msg: req.body.msg,
    });

    try {
        const newMessage = await message.save();
        // Emitir el evento 'message' a todos los clientes
        socket.emit("message", newMessage);

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const messages = await msgModel.find().lean();
        res.render("chat", { messages });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
