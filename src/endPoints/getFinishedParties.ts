import { Response, Request } from "express";
import { UserModel } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { ActiveGameModel } from "../models/active-game.model.js";
import { Op } from "sequelize";
export const GetFinishedParties = (req: Request, res: Response) => {
  (async () => {
    console.log("OnGetActivePartiesPost:");
    //console.log(req.cookies);
    console.log(req.body);
    const activeGames = await ActiveGameModel.findAll({
      where: {
        [Op.or]: [
          {
            userBUuid: req.body.userUuid,
          },
          {
            userWUuid: req.body.userUuid,
          },
        ],
        status: {
          [Op.ne]: "Active",
        },
      },
      include: [
        {
          association: "party",
          include: ["partyMoves"],
        },
      ],
    });
    if (activeGames.length) {
      console.log(activeGames);
      const opponents: UserModel[] = [];
      for (const i of activeGames) {
        opponents.push(
          (
            await UserModel.findOne({
              where: {
                uuid:
                  i.dataValues.userWUuid === req.body.userUuid
                    ? i.dataValues.userBUuid
                    : i.dataValues.userWUuid,
              },
            })
          ).dataValues as UserModel,
        );
      }
      res.status(200);
      res.json({
        opponents: opponents,
        // activeGames: {
        //   ...activeGame.dataValues,
        //   party: undefined,
        //   messages: undefined,
        // },
        activeGames: [
          ...activeGames.map((value) => {
            return {
              ...value.dataValues,
              party: undefined,
              messages: undefined,
            };
          }),
        ],
        // activeParty: {
        //   ...activeGame.dataValues.party.dataValues,
        //   partyMoves: undefined,
        // },
        activeParties: [
          ...activeGames.map((value) => {
            return {
              ...value.dataValues.party.dataValues,
              partyMoves: undefined,
            };
          }),
        ],
        // partyMoves: [
        //   ...activeGame.dataValues.party.dataValues.partyMoves.map((value) => {
        //     return value.dataValues;
        //   }),
        // ],
        partyMoves: [
          ...activeGames.map((value) => {
            return value.dataValues.party.dataValues.partyMoves.map((value) => {
              return value.dataValues;
            });
          }),
        ],
      });
    } else {
      console.log("No games associated with passed data");
      res.status(400);
      res.send("No games associated with passed data");
    }
  })();
};
