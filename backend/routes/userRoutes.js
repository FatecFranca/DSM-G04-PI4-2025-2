const router = require("express").Router();
const UserController = require("../controllers/UserControllers");
const checkRole = require("../helpers/checkRole");
const isAuthenticated = require("../helpers/isAuthenticated");

router.post("/login", UserController.login);
router.post(
  "/register",
  isAuthenticated,
  checkRole(["gerente"]),
  UserController.addFuncionario
);
router.get('/:id',isAuthenticated, checkRole(['gerente']), UserController.getFuncionario )
router.get('/', isAuthenticated, checkRole(['gerente']), UserController.getAllFuncionarios)
router.patch('/:id', isAuthenticated, checkRole(['gerente']), UserController.updateFuncionario);
router.delete('/:id', isAuthenticated, checkRole(['gerente']), UserController.deleteFuncionario);

module.exports = router;
