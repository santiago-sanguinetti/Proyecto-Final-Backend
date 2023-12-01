export const createProductErrorInfo = (product) => {
    return `Uno de los siguientes campos está incompleto o no es válido.
    Lista de propiedades requeridas:
    - title       : se requiere un String,  se recibió ${product.title}
    - description : se requiere un String,  se recibió ${product.description}
    - code        : se requiere un String,  se recibió ${product.code}
    - price       : se requiere un Number,  se recibió ${product.price}
    - status      : se requiere un Boolean, se recibió ${product.status}
    - stock       : se requiere un Number,  se recibió ${product.stock}
    - category    : se requiere un String,  se recibió ${product.category}
    - thumbnails  : se requiere un Object,  se recibió ${product.thumbnails}
    `;
};

export const getAllProductsErrorInfo = (params) => {
    return `Uno de los siguientes parámetros está incompleto o no es válido.
    Lista de propiedades requeridas:
    - limit : se requiere un Number, se recibió ${params.limit}
    - page  : se requiere un Number, se recibió ${params.page}
    - sort  : (opcional) se requiere "asc" o "desc", se recibió ${params.sort}
    - query : (opcional) no genera errores, solo para debug: se recibió ${params.query}`;
};

export const getProductByIdErrorInfo = (invalidId = "") => {
    if (invalidId)
        return `El id proporcionado no es un id de MongoDB válido, se recibió ${invalidId}`;
    return `No se pudo encontrar el producto en la base de datos`;
};

export const alreadyExistsInDB = (subject) => {
    return `El ${subject} ya existe en la base de datos`;
};

export const notFoundInDB = (subject) => {
    return `El ${subject} no existe en la base de datos`;
};

export const emptyCart = (products) => {
    return `Se espera recibir un array con objetos, se recibió ${products}`;
};

export const insufficientStock = (outOfStockProducts) => {
    return `No hay suficiente stock para los siguientes productos: ${outOfStockProducts}`;
};

export const passportAuthenticateError = (info) => {
    return `Error al intentar autenticar con passport: ${info.message}`;
};

export const saveResetTokenError = () => {
    return `Error al guardar el token de restablecimiento de contraseña.`;
};

export const invalidEmailError = () => {
    return `No se recibió un email, o el email es inválido`;
};

export const tokenNotReceived = () => {
    return `Se debe ingresar un token`;
};

export const invalidToken = () => {
    return `El token ingresado no es válido o expiró`;
};
