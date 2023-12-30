import express from "express";
import passport from "passport";
import { verifyToken, authenticate } from "../auth/middlewares.js";
import {
    forgotPassword,
    resetPassword,
    swapUserRole,
    updateUserStatus,
    uploadDocuments,
    getAllUsers,
    getAllInactiveUsersEmail,
    deleteAllInactiveUsers,
    emailInactiveUsers,
    updateRole,
    deleteUser,
} from "../controllers/users.controller.js";
import userManager from "../dao/managers/users.manager.js";
import { upload } from "../config/multer.config.js";

const usersManager = new userManager();

const router = express.Router();

router.get("/", getAllUsers);

router.delete(
    "/",
    getAllInactiveUsersEmail,
    emailInactiveUsers,
    deleteAllInactiveUsers
);

router.post(
    "/register",

    passport.authenticate("register", {
        successRedirect: "/login",
        failureRedirect: "/register",
    })
);

router.post("/login", authenticate);

router.post("/logout", verifyToken, (req, res) => {
    usersManager.updateLastConnection(req.user);
    res.clearCookie("token");
    req.session.destroy();
    res.redirect("/");
});

router.post("/forgot-my-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.get(
    "/github",
    passport.authenticate("github", { scope: ["user:email"] }),
    async (req, res) => {}
);

router.get(
    "/githubcallback",
    passport.authenticate("github", { failureRedirect: "/login" }),
    async (req, res) => {
        req.session.user = req.user;
        res.redirect("/");
    }
);

router.get("/current", verifyToken, (req, res) => {
    res.json({
        message: "Autenticado correctamente",
        user: req.user,
    });
});

router.put("/premium/:uid", swapUserRole);

router.post(
    "/:uid/documents",
    upload.array("files"),
    uploadDocuments,
    updateUserStatus
);

router.post("/update-role/:uid", updateRole);
router.post("/delete-user/:uid", deleteUser);

export default router;
