import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./Users.js";

const { DataTypes } = Sequelize;

const FriendList = db.define('friendList', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    req_to: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    freezeTableName: true
});

// Relasi user dan friendlist
Users.hasMany(FriendList);
FriendList.belongsTo(Users, { foreignKey: 'userId' });

export default FriendList;