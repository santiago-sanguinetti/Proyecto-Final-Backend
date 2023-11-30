import __dirname from "../utils.js";

export const swaggerOptions = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: "Documentación proyecto Ecommerce Backend",
            description:
                "API para un Ecommerce. Deberás autenticarte con el token recibido en la cookie llamada 'token' que se define al iniciar sesión en la API para recibir autorización a ciertos endpoints.",
        },
    },
    apis: [`${__dirname}/docs/**/*.yaml`],
};
