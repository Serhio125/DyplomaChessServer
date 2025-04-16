import { Response, Request } from "express";
import { UserModel } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { ActiveGameModel } from "../models/active-game.model.js";
import { Op } from "sequelize";
export const LoadActivePartyEndPoint = (req: Request, res: Response) => {
  (async () => {
    console.log("OnLoadActivePartyPost:");
    //console.log(req.cookies);
    console.log(req.body);
    const activeGame = await ActiveGameModel.findOne({
      where: {
        [Op.or]: [
          {
            userBUuid: req.body.userUuid,
          },
          {
            userWUuid: req.body.userUuid,
          },
        ],
        uuid: req.body.gameUuid,
      },
      include: [
        {
          association: "party",
          include: ["partyMoves"],
        },
        "messages",
      ],
    });
    if (activeGame) {
      console.log(activeGame);
      const opponent = await UserModel.findOne({
        where: {
          uuid:
            activeGame.dataValues.userWUuid === req.body.userUuid
              ? activeGame.dataValues.userBUuid
              : activeGame.dataValues.userWUuid,
        },
      });
      res.status(200);
      res.json({
        opponent: opponent
          ? {
              ...opponent.dataValues,
            }
          : undefined,
        activeGame: {
          ...activeGame.dataValues,
          party: undefined,
          messages: undefined,
        },
        activeParty: {
          ...activeGame.dataValues.party.dataValues,
          partyMoves: undefined,
        },
        partyMoves: [
          ...activeGame.dataValues.party.dataValues.partyMoves.map((value) => {
            return value.dataValues;
          }),
        ],
        messages: [
          ...activeGame.dataValues.messages.map((value) => {
            return value.dataValues;
          }),
        ],
      });
    } else {
      console.log("No party associated with passed data");
      res.status(400);
      res.send("No party associated with passed data");
    }
  })();
};
