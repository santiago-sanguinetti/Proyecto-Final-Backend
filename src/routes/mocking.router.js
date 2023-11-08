import express from "express";
import { generate100Products } from "../controllers/mocking.controller.js";

const router = express.Router();

router.get("/", generate100Products);

export default router;
