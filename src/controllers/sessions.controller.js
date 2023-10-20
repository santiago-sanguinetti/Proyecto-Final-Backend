import Users from "../dao/managers/users.manager.js";
import { adminUser } from "../config/admin.config.js";

const sessionsManager = new Users();

export const validateLogin = async (req, res) => {
    if (!req.user)
        return res
            .status(400)
            .send({ status: "error", error: "Invalid credentials" });
    req.user.email === adminUser.email
        ? (req.session.user = adminUser)
        : (req.session.user = {
              first_name: req.user.first_name,
              last_name: req.user.last_name,
              age: req.user.age,
              email: req.user.email,
              role: req.user.role,
              cart: req.user.cart,
          });
    res.redirect("/profile");
};
