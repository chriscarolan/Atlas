const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    static associate(models) {
      Inventory.belongsTo(models.Manager, { foreignKey: 'manager_id', as: 'manager' });
      // If Invoice_Items refers to Inventory items directly, add association here
      // Inventory.hasMany(models.InvoiceItem, { foreignKey: 'inventory_id', as: 'invoiceLineItems' });
    }
  }
  Inventory.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    price_per_pound: {
      type: DataTypes.DECIMAL(10, 2)
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(100)
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2)
    },
    price_per_box: {
      type: DataTypes.DECIMAL(10, 2)
    },
    manager_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'managers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL' // Matches schema definition
    }
  }, {
    sequelize,
    modelName: 'Inventory',
    tableName: 'inventory',
    timestamps: false
  });
  return Inventory;
}; 