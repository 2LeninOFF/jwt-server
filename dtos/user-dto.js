//DTO = Data transfer object
module.exports = class UserDto {
  email;
  id;
  isActivated;

  constructor(model) {
    this.email = model.email;
    this.id = model._id; // так требует монго
    this.isActivated = model.isActivated;
  }
};
