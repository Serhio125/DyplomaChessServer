import { Response, Request } from "express";
import { UserModel } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { PassHashModel } from "../models/passHash.model.js";
export const RegistrEndPoint = (req: Request, res: Response) => {
  (async () => {
    console.log("OnRegistrPost:");
    console.log(req.body);
    let password: string;
    try {
      password = Buffer.from(req.body.password, "base64url").toString();
    } catch (e: any) {
      res.status(400).send("Некорректный пароль");
      return;
    }
    const clientCheck = await UserModel.findOne({
      where: {
        login: req.body.login,
      },
      raw: true,
    });
    if (!clientCheck) {
      try {
        const clientCreate = await UserModel.create({
          login: req.body.login,
          role: "User",
          firstName: req.body.firstName ? req.body.firstName : null,
          lastName: req.body.lastName ? req.body.lastName : null,
          country: req.body.country ? req.body.country : null,
        });
        if (clientCreate) {
          try {
            const passHashCreate = await PassHashModel.create({
              userUuid: clientCreate.uuid,
              passwordHash: bcryptjs.hashSync(password, 3),
            });
            if (passHashCreate) {
              console.log(`User created success`);
              res.status(200);
              res.send("Пользователь создан успешно");
            } else {
              console.log("Ошибка при создании хэша пароля:");
              try {
                await UserModel.destroy({
                  where: {
                    uuid: clientCreate.uuid,
                  },
                });
              } catch (e: any) {
                console.log(
                  `Ошибка при удалении пользователя из таблицы users, uuid = ${clientCreate.uuid}`,
                );
                console.log(e);
              } finally {
                res.status(300);
                res.send("Ошибка при создании пользователя");
              }
            }
          } catch (e: any) {
            console.log("Ошибка при создании хэша пароля:");
            console.log(e);
            try {
              await UserModel.destroy({
                where: {
                  uuid: clientCreate.uuid,
                },
              });
            } catch (e: any) {
              console.log(
                `Ошибка при удалении пользователя из таблицы users, uuid = ${clientCreate.uuid}`,
              );
              console.log(e);
            } finally {
              res.status(300);
              res.send("Ошибка при создании пользователя");
            }
          }
        } else {
          console.log("Ошибка при создании пользователя:");
          res.status(300);
          res.send("Ошибка при создании пользователя");
        }
      } catch (e: any) {
        console.log("Ошибка при создании пользователя:");
        console.log(e);
        res.status(300);
        res.send("Ошибка при создании пользователя");
      }
    } else {
      res.status(400);
      res.send("Логин занят");
    }
  })();
};
