import express from "express";
import { loggerTest } from "../controllers/logger.controller.js";

const router = express.Router();

router.get("/", loggerTest);

export default router;
