const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user.model");

const Group = sequelize.define("Group", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

User.belongsTo(Group, { foreignKey: "groupId" });
Group.hasMany(User, { foreignKey: "groupId" });

module.exports = Group;
