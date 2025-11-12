const router = require("express").Router();
const AuthController = require("../controllers/AuthController");

router.post("/refresh", AuthController.refreshToken);

router.post("/logout", AuthController.logout);

module.exports = router;