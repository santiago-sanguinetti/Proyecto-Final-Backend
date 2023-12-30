import chai from "chai";
import supertest from "supertest";
import { dotenvConfig as env } from "../src/config/dotenv.config.js";

const expect = chai.expect;
const requester = supertest("http://localhost:8080");

describe("Testing módulo carritos", () => {
    let token;
    let cid;
    let pid;
    before(async () => {
        try {
            //Este es un usuario premium
            let res = await requester
                .post("/api/sessions/login")
                .set("Accept", "application/json")
                .send({
                    email: env.testUser,
                    password: env.testPassword,
                });

            token = res.body.token;

            res = await requester
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

            pid = res.body._id;
        } catch (err) {
            console.error(err);
        }
    });

    after(async () => {
        try {
            let res = await requester
                .delete(`/api/products/${pid}`)
                .set("Authorization", `Bearer ${token}`)
                .send();
        } catch (err) {
            console.error(err);
        }
    });

    describe("Test 1: crear un carrito", () => {
        it("El endpoint POST /api/carts debe devolver un carrito", async () => {
            const { statusCode, ok, body } = await requester
                .post("/api/carts")
                .send({
                    products: [],
                });

            cid = body._id;

            expect(ok).to.be.equal(true);
            expect(body).to.have.property("_id").that.is.an("string");
        });
    });

    describe("Test 2: agregar un producto propio al carrito", () => {
        it("El endpoint /api/carts/:cid/product/:pid debe devolver un error", async () => {
            let { statusCode, ok, body } = await requester
                .post(`/api/carts/${cid}/product/${pid}`)
                .set("Authorization", `Bearer ${token}`)
                .send();

            expect(statusCode).to.be.equal(400);
            expect(body)
                .to.have.property("message")
                .that.is.equal(
                    "No puedes agregar tus propios productos al carrito"
                );
        });
    });

    describe("Test 3: obtener el carrito", () => {
        it("El endpoint /api/carts/:cid debe devolver el carrito (vacío)", async () => {
            let { statusCode, ok, body } = await requester
                .get(`/api/carts/${cid}`)
                .send();

            expect(body)
                .to.have.property("populatedCart")
                .that.is.an("object")
                .that.has.a.property("products")
                .that.is.an("array").that.is.empty;
        });
    });
});
