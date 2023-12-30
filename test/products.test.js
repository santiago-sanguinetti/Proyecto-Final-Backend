import chai from "chai";
import supertest from "supertest";
import { dotenvConfig as env } from "../src/config/dotenv.config.js";

const expect = chai.expect;
const requester = supertest("http://localhost:8080");

describe("Testing módulo productos", () => {
    let token;
    let pid;
    before(async () => {
        try {
            //Este es un usuario premium
            const res = await requester
                .post("/api/sessions/login")
                .set("Accept", "application/json")
                .send({
                    email: env.testUser,
                    password: env.testPassword,
                });

            token = res.body.token;
        } catch (err) {
            console.error(err);
        }
    });

    describe("Test 1: obtener productos", () => {
        it("El endpoint GET /api/products debe devolver una lista de productos", async () => {
            const { statusCode, ok, body } = await requester
                .get("/api/products")
                .send();

            expect(body.payload).to.be.an("array").that.does.not.include(null);
        });
    });

    describe("Test 2: crear producto", () => {
        it("El endpoint POST /api/products debe crear un producto", async () => {
            const { statusCode, ok, body } = await requester
                .post("/api/products")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Producto de prueba",
                    description: "Este es un producto para testing",
                    code: "0-226-35159-9",
                    price: 50,
                    status: true,
                    stock: 30,
                    category: "Prueba",
                    thumbnails: ["url1", "url2"],
                });
            pid = body._id;

            expect(body).to.have.property("_id").that.is.an("string");
        });
    });

    describe("Test 3: buscar el producto", () => {
        it("El endpoint GET /api/products/:pid debe devolver un producto", async () => {
            const { statusCode, ok, body } = await requester
                .get(`/api/products/${pid}`)
                .send();

            expect(body[0]).to.have.property("_id").that.is.an("string"); //Este endpoint devuelve un array con 1 producto
        });
    });

    describe("Test 4: eliminar el producto", () => {
        it("El endpoint DELETE /api/products/pid debe eliminar el producto", async () => {
            const { statusCode, ok, body } = await requester
                .delete(`/api/products/${pid}`)
                .set("Authorization", `Bearer ${token}`)
                .send();

            expect(body)
                .to.have.property("message")
                .that.is.equal("Producto eliminado");
        });
    });

    describe("Test 5: crear producto sin token válido", () => {
        it("El endpoint POST /api/products debe devolver un error de acceso denegado", async () => {
            const { statusCode, ok, body } = await requester
                .post("/api/products")
                .send({
                    title: "Producto de prueba",
                    description: "Este es un producto para testing",
                    code: "0-226-35159-9",
                    price: 50,
                    status: true,
                    stock: 30,
                    category: "Prueba",
                    thumbnails: ["url1", "url2"],
                });

            expect(ok).to.be.equal(false);
            expect(body)
                .to.have.property("error")
                .that.is.equal("Acceso denegado");
        });
    });
});
