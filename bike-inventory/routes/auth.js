const router = require("express").Router();
const { login, checkAuth, logout } = require("../controllers/authController");

router.post("/login", login);
router.get("/check-auth", checkAuth);
router.get("/logout", logout);

module.exports = router;
