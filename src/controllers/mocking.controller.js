import { logger } from "../config/logger.config.js";
import { generateProduct } from "../utils.js";

export const generate100Products = async (req, res) => {
    logger.info("Generando 100 productos");
    let products = [];
    for (let i = 0; i < 100; i++) {
        products.push(generateProduct());
    }
    logger.info("Productos generados exitosamente");
    res.send({ status: "success", payload: products });
};
