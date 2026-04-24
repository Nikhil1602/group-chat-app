const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ArchivedMessage = sequelize.define("ArchivedMessage", {
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE
    }
});

module.exports = ArchivedMessage;