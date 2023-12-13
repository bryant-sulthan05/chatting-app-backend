import { Sequelize } from "sequelize";

const db = new Sequelize('chatting-app', 'root', '', {
    host: "localhost",
    dialect: "mysql"
});

export default db;