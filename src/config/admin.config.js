import { dotenvConfig } from "./config.js";

export function isAdmin(email, password) {
    const adminEmail = dotenvConfig.adminEmail;
    const adminPassword = dotenvConfig.adminPassword;
    //Devuelve un booleano si coinciden los datos
    return email === adminEmail && password === adminPassword;
}

export const adminUser = {
    _id: "42",
    first_name: "Admin",
    last_name: "",
    email: dotenvConfig.adminEmail,
    age: 42,
    password: dotenvConfig.adminPassword,
    role: "admin",
    cart: "6509ec5bdc95728198f484f9",
};
