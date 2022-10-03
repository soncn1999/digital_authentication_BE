'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Auth_info extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Auth_info.belongsTo(models.User, { foreignKey: 'user_id', targetKey: 'id', as: 'userData' });
    }
  }
  Auth_info.init({
    user_id: DataTypes.INTEGER,
    privateKey: DataTypes.TEXT,
    sign: DataTypes.TEXT,
    certificate: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Auth_info',
  });
  return Auth_info;
};