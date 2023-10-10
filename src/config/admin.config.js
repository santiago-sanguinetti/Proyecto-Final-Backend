export function isAdmin(email, password) {
    const adminEmail = "adminCoder@coder.com";
    const adminPassword = "adminCod3r123";
    //Devuelve un booleano si coinciden los datos
    return email === adminEmail && password === adminPassword;
}

export const adminUser = {
    _id: "42",
    first_name: "Admin",
    last_name: "",
    email: "adminCoder@coder.com",
    age: 42,
    password: "adminCod3r123",
    role: "admin",
    cart: "6509ec5bdc95728198f484f9",
};
