import __dirname from "../utils.js";

export const swaggerOptions = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: "Documentación proyecto Ecommerce Backend",
            description:
                "Para acceder a los endpoints privados debe proporcionar el token que recibe al iniciar sesión.",
        },
    },
    apis: [`${__dirname}/docs/**/*.yaml`],
};
