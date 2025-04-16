import { Socket } from "socket.io";
import { ActiveGameModel } from "../models/active-game.model.js";
import { PartyModel } from "../models/party.model.js";
import { sequelize } from "../sequelize/sequelizeInst.js";
import { PartyMoveModel } from "../models/party-move.model.js";
import { MessageModel } from "../models/message.model.js";
import { Op } from "sequelize";
import { ReportModel } from "../models/report.model.js";
export interface PartyMoveData {
  index: number;

  before: string | undefined;

  after: string | undefined;

  color: string | undefined;

  piece: string | undefined;

  from: string | undefined;

  to: string | undefined;

  san: string | undefined;

  lan: string | undefined;

  flags: string | undefined;

  captured: string | undefined;
}
export interface ActiveGameUserData {
  userUuid: string;
  gameUuid: string;
  move: PartyMoveData | undefined;
  message: string | undefined;
  partyUuid: string;
}

export interface ReportUserData {
  userSrcUuid?: string;
  userDstUuid?: string;
  gameUuid?: string;
  describe?: string;
}
interface UsersQueueType {
  socket: Socket;
  userData: {
    userUuid: string;
    gameUuid: string;
  };
}

class ActiveGameWebSocket {
  usersQueue: UsersQueueType[] = [];

  addUserToQueue = (
    socket: Socket,
    userData: {
      userUuid: string;
      gameUuid: string;
    },
  ) => {
    (async () => {
      if (userData.userUuid && userData.gameUuid) {
        console.log(userData.userUuid);
        console.log(userData.gameUuid);
        if (
          !this.usersQueue.find(
            (value) =>
              value.userData.userUuid === userData.userUuid &&
              value.userData.gameUuid === userData.gameUuid,
          )
        ) {
          console.log(
            `New user with uuid=${userData.userUuid} and gameUuid=${userData.gameUuid}connected`,
          );
          this.usersQueue.push({
            socket: socket,
            userData: userData,
          });
          socket.on("disconnect", (reason) => {
            console.log(
              `User with uuid=${userData.userUuid} disconnected from gameUuid=${userData.gameUuid}`,
            );
            console.log(reason);
            this.usersQueue = this.usersQueue.filter(
              (value) =>
                value.userData.userUuid !== userData.userUuid ||
                value.userData.gameUuid !== userData.gameUuid,
            );
          });
          socket.on("move", (moveData: ActiveGameUserData) => {
            (async () => {
              console.log(`move Event:`);
              console.log(moveData);
              try {
                const partyMove = await PartyMoveModel.create({
                  ...moveData.move,
                  partyUuid: moveData.partyUuid,
                });
                try {
                  await PartyModel.update(
                    {
                      lastMoveUuid: partyMove.uuid,
                      currentPos: moveData.move.after,
                    },
                    {
                      where: {
                        uuid: moveData.partyUuid,
                      },
                    },
                  );
                  console.log("Updated with move data success?");
                  this.usersQueue
                    .find(
                      (value) =>
                        value.userData.gameUuid === moveData.gameUuid &&
                        value.userData.userUuid !== moveData.userUuid,
                    )
                    ?.socket.emit("move", {
                      position: moveData.move.after,
                      move: moveData.move,
                    });
                } catch (e: any) {
                  console.log(`Error when update PartyModel:`);
                  console.log(e);
                  await PartyMoveModel.destroy({
                    where: {
                      uuid: partyMove.uuid,
                    },
                  });
                }
              } catch (e: any) {
                console.log(`Error when create PartyMove:`);
                console.log(e);
              }
            })();
          });
          socket.on("message", (moveData: ActiveGameUserData) => {
            (async () => {
              console.log(`message Event:`);
              console.log(moveData);
              try {
                const message = await MessageModel.create({
                  gameUuid: moveData.gameUuid,
                  srcUserUuid: moveData.userUuid,
                  content: moveData.message,
                });
                this.usersQueue
                  .find(
                    (value) =>
                      value.userData.gameUuid === moveData.gameUuid &&
                      value.userData.userUuid !== moveData.userUuid,
                  )
                  ?.socket.emit("message", {
                    message: moveData.message,
                  });
              } catch (e: any) {
                console.log(`Error when create Message:`);
                console.log(e);
              }
            })();
          });
          socket.on("gameover", (moveData: ActiveGameUserData) => {
            (async () => {
              console.log(`message Event:`);
              console.log(moveData);
              try {
                // const message = await MessageModel.create({
                //   gameUuid: moveData.gameUuid,
                //   srcUserUuid: moveData.userUuid,
                //   content: moveData.message,
                // });
                const updateGame = await ActiveGameModel.update(
                  {
                    status: moveData.message,
                  },
                  {
                    where: {
                      uuid: moveData.gameUuid,
                    },
                  },
                );
                this.usersQueue
                  .find(
                    (value) =>
                      value.userData.gameUuid === moveData.gameUuid &&
                      value.userData.userUuid !== moveData.userUuid,
                  )
                  ?.socket.emit("gameover", {
                    result: moveData.message,
                  });
              } catch (e: any) {
                console.log(`Error when create Message:`);
                console.log(e);
              }
            })();
          });
          socket.on("drawsuggest", (moveData: ActiveGameUserData) => {
            (async () => {
              console.log(`drawsuggest Event:`);
              console.log(moveData);
              try {
                // const message = await MessageModel.create({
                //   gameUuid: moveData.gameUuid,
                //   srcUserUuid: moveData.userUuid,
                //   content: moveData.message,
                // });
                this.usersQueue
                  .find(
                    (value) =>
                      value.userData.gameUuid === moveData.gameUuid &&
                      value.userData.userUuid !== moveData.userUuid,
                  )
                  ?.socket.emit("drawsuggest", {});
              } catch (e: any) {
                console.log(`Error when create Message:`);
                console.log(e);
              }
            })();
          });
          socket.on("takebackrequest", (moveData: ActiveGameUserData) => {
            (async () => {
              console.log(`takebackrequest Event:`);
              console.log(moveData);
              try {
                // const message = await MessageModel.create({
                //   gameUuid: moveData.gameUuid,
                //   srcUserUuid: moveData.userUuid,
                //   content: moveData.message,
                // });
                this.usersQueue
                  .find(
                    (value) =>
                      value.userData.gameUuid === moveData.gameUuid &&
                      value.userData.userUuid !== moveData.userUuid,
                  )
                  ?.socket.emit("takebackrequest", {});
              } catch (e: any) {
                console.log(`Error when create Message:`);
                console.log(e);
              }
            })();
          });
          socket.on("takeback", (takebackData: ActiveGameUserData) => {
            (async () => {
              console.log(`takebackaccept Event:`);
              console.log(takebackData);
              try {
                const updateParty = await PartyModel.update(
                  {
                    currentPos: takebackData.move.after,
                    // @ts-ignore
                    lastMoveUuid: takebackData.move.uuid,
                  },
                  {
                    where: {
                      uuid: takebackData.partyUuid,
                    },
                  },
                );
                try {
                  const movesDestroys = await PartyMoveModel.destroy({
                    where: {
                      partyUuid: takebackData.partyUuid,
                      index: {
                        [Op.gt]: takebackData.move.index,
                      },
                    },
                  });
                  this.usersQueue
                    .find(
                      (value) =>
                        value.userData.gameUuid === takebackData.gameUuid &&
                        value.userData.userUuid !== takebackData.userUuid,
                    )
                    ?.socket.emit("takeback", {
                      ...takebackData,
                    });
                } catch (e: any) {
                  console.log(`Error when destroys lasts moves on takeback:`);
                  console.log(e);
                }
              } catch (e: any) {
                console.log(`Error when update on request:`);
                console.log(e);
              }
            })();
          });
          socket.on("report", (reportData: ReportUserData) => {
            // console.log("New report emits with data:");
            // console.log(reportData);
            (async () => {
              try {
                await ReportModel.create({
                  status: "Active",
                  srcUserUuid: reportData.userSrcUuid,
                  dstUserUuid: reportData.userDstUuid,
                  activeGameUuid: reportData.gameUuid,
                  describe: reportData.describe,
                  adminUuid: null,
                });
                console.log("New report successed created");
              } catch (e: any) {
                console.log(
                  `Error when creating new report with next data: ${reportData}`,
                );
                console.log(e);
              }
            })();
          });
        } else {
          socket.emit("clientError", {
            reason: "You currently are playing the party",
          });
          socket.disconnect(true);
        }
      } else {
        socket.emit("clientError", {
          reason: "Invalid request without Users uuid & Game uuid",
        });
        socket.disconnect(true);
      }
    })();
  };
}

export const activeGameWebSocket = new ActiveGameWebSocket();
