const UserModel = require("../models/user-model");
const User0Model = require("../models/user0-model");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const mailService = require("./mail-service");
const tokenService = require("./token-service");
const UserDto = require("../dtos/user-dto");
const UserDto3 = require("../dtos/user-dto3");
const ApiError = require("../exceptions/api-error");

class UserService {
  async registration(email, password) {
    console.log("password in async registration:", password);
    const candidate = await UserModel.findOne({ email }); //проверяем почту на уникальность
    if (candidate) {
      //если не равен null
      throw ApiError.BadRequest(
        `Пользователь с почтовым адресом ${email} уже существует`
      );
    }
    const hashPassword = await bcrypt.hash(password, 3); //хэшируем пароль
    const activationLink = uuid.v4(); //ссылка для активации
    //сохраняем юзера в БД
    const user0 = await User0Model.create({
      email,
      password: hashPassword,
      activationLink,
    });
    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/activate/${activationLink}`
    );

    const userDto = new UserDto(user0); // id, email, isActivated
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user0: userDto };
  }

  async activate(activationLink) {
    const user0 = await User0Model.findOne({ activationLink });
    console.log("user0 in activate", user0);
    if (!user0) {
      throw ApiError.BadRequest("Некорректная ссылка активации");
    }
    const user = await UserModel.create({
      email: user0.email,
      password: user0.password,
      activationLink,
    });
    user.isActivated = true;
    await user.save();
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest("Пользователь с таким 000 email не найден");
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    console.log("isPassEquals in user-service:", isPassEquals);
    console.log("password in user-service:", password);
    console.log("user.password in user-service:", user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest("Неверный пароль");
    }
    //из модели выбрасываем всё ненужное
    console.log("user in user-service:", user);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    console.log("UserService in async activate:", UserService);
    return { ...tokens, user: userDto };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    //валидация
    const userData = tokenService.validateRefreshToken(refreshToken);
    //поиск в БД
    const tokenFromDb = await tokenService.findToken(refreshToken);
    //проверяем, что валидация и поиск в БД прошли успешно
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }
    const user = await UserModel.findById(userData.id);
    console.log("async refresh in user-service");
    const userDto = new UserDto3(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async getAllUsers() {
    const users = await UserModel.find();
    return users;
  }
}

module.exports = new UserService();
