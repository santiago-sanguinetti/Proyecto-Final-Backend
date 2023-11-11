export const loggerTest = async (req, res) => {
    req.logger.debug("Test: log de nivel debug");
    req.logger.http(" Test: log de nivel http");
    req.logger.info("Test: log de nivel info");
    req.logger.warning("Test: log de nivel warning");
    req.logger.error("Test: log de nivel error");
    req.logger.fatal("Test: log de nivel fatal");

    res.send("Test finalizado, chequea la consola");
};
