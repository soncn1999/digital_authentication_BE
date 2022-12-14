'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasOne(models.Auth_info, { foreignKey: 'user_id', as: 'userData' });
    }
  }
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    token: DataTypes.STRING,
    organization: DataTypes.STRING,
    public_key: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};