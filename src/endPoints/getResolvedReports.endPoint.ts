import { Response, Request } from "express";
import { UserModel } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { ActiveGameModel } from "../models/active-game.model.js";
import { Op } from "sequelize";
import { ReportModel } from "../models/report.model.js";
export const GetResolvedReportsEndPoint = (req: Request, res: Response) => {
  (async () => {
    console.log("OnGetResolvedReportsPost:");
    //console.log(req.cookies);
    console.log(req.body);
    const user = await UserModel.findOne({
      where: {
        uuid: req.body.userUuid,
      },
    });
    if (!user || user.role !== "Admin") {
      console.log("User with role !== Admin requests");
      res.status(400);
      res.send("Invalid users credentials");
      return;
    }
    const reports = await ReportModel.findAll({
      where: {
        status: {
          [Op.ne]: "Active",
        },
      },
      raw: true,
    });
    if (reports.length) {
      console.log(reports);
      const users: { userSrc: string; userDst: string; admin: string }[] = [];
      for (const i of reports) {
        users.push({
          userSrc: (
            await UserModel.findOne({
              where: {
                uuid: i.srcUserUuid,
              },
            })
          ).login,
          userDst: (
            await UserModel.findOne({
              where: {
                uuid: i.dstUserUuid,
              },
            })
          ).login,
          admin: (
            await UserModel.findOne({
              where: {
                uuid: i.adminUuid,
              },
            })
          ).login,
        });
      }
      res.status(200);
      res.json({
        users: users,
        reports: reports,
      });
    } else {
      console.log("No games associated with passed data");
      res.status(400);
      res.send("No games associated with passed data");
    }
  })();
};
