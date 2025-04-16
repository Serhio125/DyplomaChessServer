import { Response, Request } from "express";
import { UserModel } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { ActiveGameModel } from "../models/active-game.model.js";
import { Op } from "sequelize";
import { ReportModel } from "../models/report.model.js";
export const LoadActiveReportEndPoint = (req: Request, res: Response) => {
  (async () => {
    console.log("OnLoadActiveReportPost:");
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
    const report = await ReportModel.findOne({
      where: {
        uuid: req.body.reportUuid,
      },
      include: [
        {
          association: "activeGame",
          required: true,
          include: [
            {
              association: "messages",
            },
            {
              association: "party",
              include: [
                {
                  association: "partyMoves",
                },
              ],
            },
          ],
        },
      ],
    });
    if (report) {
      console.log(report);
      const users: { userSrc: string; userDst: string; admin?: string } = {
        userSrc: (
          await UserModel.findOne({
            where: {
              uuid: report.dataValues.srcUserUuid,
            },
          })
        ).login,
        userDst: (
          await UserModel.findOne({
            where: {
              uuid: report.dataValues.dstUserUuid,
            },
          })
        ).login,
        admin: report.adminUuid
          ? (
              await UserModel.findOne({
                where: {
                  uuid: report.dataValues.adminUuid,
                },
              })
            ).login
          : null,
      };
      res.status(200);
      res.json({
        users: users,
        report: {
          ...report.dataValues,
          activeGame: undefined,
        },
        activeGame: {
          ...report.dataValues.activeGame.dataValues,
          party: undefined,
          messages: undefined,
        },
        activeParty: {
          ...report.dataValues.activeGame.dataValues.party.dataValues,
          partyMoves: undefined,
        },
        partyMoves: [
          ...report.dataValues.activeGame.dataValues.party.dataValues.partyMoves.map(
            (value) => {
              return value.dataValues;
            },
          ),
        ],
        messages: [
          ...report.dataValues.activeGame.dataValues.messages.map((value) => {
            return value.dataValues;
          }),
        ],
      });
    } else {
      console.log("No report associated with passed data");
      res.status(400);
      res.send("No report associated with passed data");
    }
  })();
};
