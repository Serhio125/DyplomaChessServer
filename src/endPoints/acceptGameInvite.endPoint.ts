import { Response, Request } from "express";
import { UserModel } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { ActiveGameModel } from "../models/active-game.model.js";
import { Op } from "sequelize";
import { ReportModel } from "../models/report.model.js";
import { GameInviteModel } from "../models/game-invite.model.js";
import dayjs from "dayjs";
import { PartyModel } from "../models/party.model.js";
import { searchGameWebSocket } from "../webSockets/search-game.webSocket.js";
export const AcceptGameInviteEndPoint = (req: Request, res: Response) => {
  (async () => {
    console.log("OnAcceptGameInvitePost:");
    //console.log(req.cookies);
    console.log(req.body);
    const user = await UserModel.findOne({
      where: {
        uuid: req.body.userUuid,
      },
    });
    if (!user || user.role === "Admin") {
      console.log("User with role !== Admin requests");
      res.status(400);
      res.send("Admin account");
      return;
    }
    const invite = await GameInviteModel.findOne({
      where: {
        uuid: req.body.inviteUuid,
      },
      raw: true,
    });
    if (
      invite &&
      invite.status === "Free" &&
      dayjs().isBefore(dayjs(invite.createdAt).add(1, "hour")) &&
      req.body.userUuid !== invite.srcUserUuid
    ) {
      console.log(invite);
      const random = Math.floor(Math.random() * 100) % 2;
      console.log(`Random=${random}`);
      console.log(req.body.userUuid);
      console.log(invite.srcUserUuid);
      try {
        const newActiveGame = await ActiveGameModel.create({
          userWUuid: random ? req.body.userUuid : invite.srcUserUuid,
          userBUuid: random ? invite.srcUserUuid : req.body.userUuid,
          status: "Active",
        });
        try {
          await PartyModel.create({
            currentPos: "start",
            startPos: "start",
            lastMoveUuid: null,
            activeGameUuid: newActiveGame.uuid,
            analysesGameUuid: null,
          });
          await GameInviteModel.update(
            {
              status: "Close",
            },
            {
              where: {
                uuid: invite.uuid,
              },
            },
          );
          res.status(200);
          res.json({
            gameUuid: newActiveGame.uuid,
          });
          searchGameWebSocket.notificationUser(
            invite.srcUserUuid,
            newActiveGame.uuid,
          );
        } catch (e: any) {
          console.log("ERROR when create new PartyModel:");
          console.log(e);
          await ActiveGameModel.destroy({
            where: {
              uuid: newActiveGame.uuid,
            },
          });
          console.log("Created active game destroyed");
          res.status(500);
          res.send("Ошибка создания новой партии, PM");
        }
      } catch (e: any) {
        console.log(`ERROR when create new ActiveGame:`);
        console.log(e);
        res.status(500);
        res.send("Ошибка создания новой партии, AG");
      }
    } else {
      if (invite.status !== "Free") {
        console.log("Invite is not free");
        res.status(400);
        res.send("Invite is not free");
      } else {
        if (!dayjs().isBefore(dayjs(invite.createdAt).add(1, "hour"))) {
          console.log("Время действия invite истекло");
          res.status(400);
          res.send("Время действия invite истекло");
        } else {
          console.log("Same account");
          res.status(400);
          res.send("Same account");
        }
      }
    }
  })();
};
