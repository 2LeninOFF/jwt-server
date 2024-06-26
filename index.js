require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const router = require("./router/index");
const errorMiddleware = require("./middlewares/error-middleware");

const PORT = process.env.PORT || 5000;
const app = express();

// middleWare
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true, //разрешаем куки
    origin: process.env.CLIENT_URL, //связь с фронтендом
  })
); //взаимодействие с сервером из браузера
app.use("/api", router);
app.use(errorMiddleware);

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {});
    app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();
