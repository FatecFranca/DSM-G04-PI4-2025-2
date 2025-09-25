const router = require("express").Router();
const UserController = require("../controllers/UserControllers");
const checkRole = require("../helpers/checkRole");
const isAuthenticated = require("../helpers/IsAuthenticated");

router.post("/login", UserController.login);
router.post(
  "/register",
  isAuthenticated,
  checkRole(["gerente"]),
  UserController.addFuncionario
);
router.get('/:id',isAuthenticated, checkRole(['gerente']), UserController.getFuncionario )
router.get('/', isAuthenticated, checkRole(['gerente']), UserController.getAllFuncionarios)

module.exports = router;
