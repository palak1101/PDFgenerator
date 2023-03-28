'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pdfdata extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  pdfdata.init(
    { 
      template_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      htmlstring: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tmp_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      tableName: 'pdfsdata',
      modelName: 'pdfdata',
    });
  return pdfdata;
};