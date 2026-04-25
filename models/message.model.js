const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user.model");

const Message = sequelize.define("Message", {
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    roomId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: { // sender
        type: DataTypes.INTEGER,
        allowNull: false
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

// Associations
User.hasMany(Message, { foreignKey: "userId" });
Message.belongsTo(User, { foreignKey: "userId" });

module.exports = Message;