import express from "express";
import passport from "passport";
import { verifyToken, authenticate, hasRole } from "../auth/middlewares.js";
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

router.get("/", verifyToken, hasRole("admin"), getAllUsers);

router.delete(
    "/",
    verifyToken,
    hasRole("admin"),
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
    if (req.user.role !== "admin") usersManager.updateLastConnection(req.user);

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
    authenticate
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
