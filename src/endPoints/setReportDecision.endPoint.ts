import { Response, Request } from "express";
import { UserModel } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { ActiveGameModel } from "../models/active-game.model.js";
import { Op } from "sequelize";
import { ReportModel } from "../models/report.model.js";
export const SetReportDecisionEndPoint = (req: Request, res: Response) => {
  (async () => {
    console.log("OnSetReportDicisionPost:");
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
    try {
      if (req.body.decision === "B") {
        await UserModel.update(
          {
            role: "Banned",
          },
          {
            where: {
              uuid: req.body.dstUserUuid,
            },
          },
        );
      } else {
        await UserModel.update(
          {
            role: "User",
          },
          {
            where: {
              uuid: req.body.dstUserUuid,
              role: "Banned",
            },
          },
        );
      }
      await ReportModel.update(
        {
          adminUuid: req.body.userUuid,
          status: req.body.decision,
        },
        {
          where: {
            uuid: req.body.reportUuid,
          },
        },
      );
      res.status(200);
      res.send("OK");
    } catch (e: any) {
      console.log(e);
      console.log("Error when updated report Decision");
      res.status(400);
      res.send("Error when updated report Decision");
    }
  })();
};
