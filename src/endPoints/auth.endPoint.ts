import { Response, Request } from "express";
import { UserModel } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
export const AuthEndPoint = (req: Request, res: Response) => {
  (async () => {
    console.log("OnAuthPost:");
    console.log(req.cookies);
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
      include: ["passHash"],
    });
    if (clientCheck) {
      // res.status(200);
      // res.json({
      //   content: "test",
      // });
      if (clientCheck.role === "Banned") {
        console.log(
          `Попытка авторизоваться под забаненным пользователем: ${clientCheck.login}`,
        );
        res.status(400);
        res.send("You are banned");
      } else {
        if (
          bcryptjs.compareSync(
            password,
            clientCheck.dataValues.passHash.dataValues.passwordHash,
          )
        ) {
          res.cookie(
            "authToken",
            jwt.sign(
              {
                ...clientCheck.dataValues,
                passHash: undefined,
              },
              "secret",
            ),
            {
              domain: "localhost",
              maxAge: 1000 * 60 * 20,
            },
          );
          res.status(200);
          res.json({
            sessionToken: jwt.sign(
              {
                ...clientCheck.dataValues,
                passHash: undefined,
              },
              "secret",
            ),
            userData: {
              ...clientCheck.dataValues,
              passHash: undefined,
            },
          });
        } else {
          res.status(400);
          res.send("Invalid password");
        }
      }
    } else {
      res.status(400);
      res.send("Invalid login");
    }
  })();
};
