//DTO = Data transfer object
module.exports = class UserDto3 {
  email;
  id;
  isActivated;

  constructor(model) {
    console.log("model 3:", model)
    this.email = model.email;
    this.id = model._id; // так требует монго
    this.isActivated = model.isActivated;
  }
};
