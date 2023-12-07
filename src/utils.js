import { fileURLToPath } from "url";
import { dirname } from "path";
import crypto from "crypto";
import { faker } from "@faker-js/faker";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function generateCode() {
    return crypto.randomBytes(16).toString("hex");
}

const generateThumbnailsArray = (imgCategory) => {
    let thumbnails = [];
    const quantity = 3;
    for (let i = 0; i < quantity; i++) {
        thumbnails.push(faker.image.urlLoremFlickr({ category: imgCategory }));
    }
    return thumbnails;
};

export const generateProduct = () => {
    const productCategory = faker.commerce.department();
    return {
        title: faker.commerce.product(),
        description: faker.commerce.productDescription(),
        code: faker.commerce.isbn(10),
        price: +faker.commerce.price(),
        status: faker.datatype.boolean(0.95),
        stock: faker.number.int({ max: 99 }),
        category: productCategory,
        thumbnails: generateThumbnailsArray(productCategory),
    };
};

export const generateUser = () => {
    return {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        age: faker.number.int({ min: 13, max: 100 }),
        password: faker.internet.password(),
    };
};

export default __dirname;
