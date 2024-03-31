const Router = require("express").Router; //импортируем роутер из экспресс
const userController = require("../controllers/user-controller");
const router = new Router(); //экземпляр роутера
const { body } = require("express-validator");
const authMiddleware = require('../middlewares/auth-middleware')

//запросы на сервер
router.post(
  "/registration",
  body("email").isEmail(),
  body("password").isLength({ min: 6, max: 32 }),
  userController.registration
);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/activate/:link", userController.activate);
router.get("/refresh", userController.refresh);
router.get("/users", authMiddleware, userController.getUsers); // получение списка юзеров, доступен только для авторизованных юзеров (для теста)

module.exports = router;
