import path from "path";
import multer from "multer";
import __dirname from "../utils.js";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let pathToStore = "";
        if (req.body.type === "profile") {
            pathToStore = path.join(__dirname, "..", "profiles");
        } else if (req.body.type === "product") {
            pathToStore = path.join(__dirname, "..", "products");
        } else if (req.body.type === "document") {
            pathToStore = path.join(__dirname, "..", "documents");
        }
        cb(null, pathToStore);
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);
        const timestamp = Date.now();
        cb(null, `${req.body.type}-${req.params.uid}-${timestamp}${extension}`);
    },
});

export const upload = multer({ storage: storage });
