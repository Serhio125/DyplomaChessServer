import { Sequelize } from "sequelize-typescript";

export const sequelize = new Sequelize("chess_database", "root", "password", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
  port: 3306,
});
