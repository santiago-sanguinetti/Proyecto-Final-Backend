import chai from "chai";
import supertest from "supertest";
import { generateUser } from "../src/utils.js";

const expect = chai.expect;
const requester = supertest("http://localhost:8080");

describe("Testing módulo sesiones", () => {
    let token;
    let userEmail;
    let userPassword;
    let user = generateUser();
    let uid;

    describe("Test 1: Registro de usuario", () => {
        it("El endpoint POST /register debe registrar un usuario", async () => {
            const { statusCode, ok, body } = await requester
                .post("/api/sessions/register")
                .send(user);

            userEmail = user.email;
            userPassword = user.password;

            expect(statusCode).to.equal(302); //Debido al redireccionamiento de passport devuelve esto
        });
    });

    describe("Test 2: Inicio de sesión", () => {
        it("El endpoint POST /login debe iniciar sesión y devolver un token", async () => {
            const { statusCode, ok, body } = await requester
                .post("/api/sessions/login")
                .send({
                    email: userEmail,
                    password: userPassword,
                });

            token = body.token;

            expect(statusCode).to.equal(200);
            expect(body).to.have.property("token").that.is.a("string");
        });
    });

    describe("Test 3: Usuario actual", () => {
        it("El endpoint GET /current debe devolver el usuario logeado", async () => {
            const { statusCode, ok, body } = await requester
                .get("/api/sessions/current")
                .set("Authorization", `Bearer ${token}`)
                .send();

            uid = body.user._id;

            expect(body)
                .to.have.property("user")
                .that.is.an("object")
                .that.has.a.property("email")
                .that.is.an("string").that.is.not.empty;
        });
    });

    describe("Test 4: Cambiar rol del usuario", () => {
        it("El endpoint PUT /premium/:uid debe cambiar el rol del usuario entre usuario y premium", async () => {
            let { statusCode, ok, body } = await requester
                .put(`/api/sessions/premium/${uid}`)
                .send();

            expect(body)
                .to.have.property("role")
                .that.is.an("string")
                .equal("premium");
        });
    });
});
