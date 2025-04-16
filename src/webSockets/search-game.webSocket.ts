import { Socket } from "socket.io";
import { ActiveGameModel } from "../models/active-game.model.js";
import { PartyModel } from "../models/party.model.js";
import { GameInviteModel } from "../models/game-invite.model.js";

export interface SearchGameUserData {
  uuid: string;
  login: string;
}

interface UsersQueueType {
  socket: Socket;
  userData: SearchGameUserData;
}

class SearchGameWebSocket {
  usersQueue: UsersQueueType[] = [];
  notificationUser = (userUuid: string, gameUuid: string) => {
    if (this.usersQueue.find((value) => value.userData.uuid === userUuid)) {
      const notificatedUser = this.usersQueue.find(
        (value) => value.userData.uuid === userUuid,
      );
      this.usersQueue = this.usersQueue.filter(
        (value) => value !== notificatedUser,
      );
      notificatedUser.socket.emit("startNewGame", {
        activeGameUuid: gameUuid,
      });
      notificatedUser.socket.disconnect(true);
    }
  };
  addUserToQueue = (socket: Socket, userData: SearchGameUserData) => {
    (async () => {
      if (userData.uuid && userData.login) {
        console.log(userData.uuid);
        console.log(userData.login);
        if (
          !this.usersQueue.find(
            (value) => value.userData.login === userData.login,
          )
        ) {
          if (this.usersQueue.length === 0) {
            console.log(`New user with Login=${userData.login} adds to Queue`);
            this.usersQueue.push({
              socket: socket,
              userData: userData,
            });
            socket.on("disconnect", (reason) => {
              console.log(
                `User with login=${userData.login} disconnected, remove from Queue?`,
              );
              console.log(reason);
              this.usersQueue = this.usersQueue.filter(
                (value) => value.userData.login !== userData.login,
              );
            });
            GameInviteModel.create({
              status: "Free",
              srcUserUuid: userData.uuid,
              inviteContent: Date(),
            })
              .then((value) => {
                if (socket.connected) {
                  socket.emit("inviteRef", {
                    inviteUuid: value.uuid,
                  });
                }
              })
              .catch((reason) => {
                console.log("Error when create invite:");
                console.log(reason);
              });
          } else {
            const anotherUserData = this.usersQueue.pop();
            const random = Math.floor(Math.random() * 100) % 2;
            console.log(`Random=${random}`);
            console.log(userData.uuid);
            console.log(anotherUserData.userData.uuid);
            try {
              const newActiveGame = await ActiveGameModel.create({
                userWUuid: random
                  ? userData.uuid
                  : anotherUserData.userData.uuid,
                userBUuid: random
                  ? anotherUserData.userData.uuid
                  : userData.uuid,
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
                socket.emit("startNewGame", {
                  activeGameUuid: newActiveGame.uuid,
                });
                socket.disconnect(true);
                anotherUserData.socket.emit("startNewGame", {
                  activeGameUuid: newActiveGame.uuid,
                });
                anotherUserData.socket.disconnect(true);
              } catch (e: any) {
                console.log("ERROR when create new PartyModel:");
                console.log(e);
                socket.emit("serverError", {
                  reason: "Server error",
                });
                socket.disconnect(true);
                anotherUserData.socket.emit("serverError", {
                  reason: "Server error",
                });
                anotherUserData.socket.disconnect(true);
                await ActiveGameModel.destroy({
                  where: {
                    uuid: newActiveGame.uuid,
                  },
                });
                console.log("Created active game destroyed");
              }
            } catch (e: any) {
              console.log(`ERROR when create new ActiveGame:`);
              console.log(e);
              socket.emit("serverError", {
                reason: "Server error",
              });
              socket.disconnect(true);
              anotherUserData.socket.emit("serverError", {
                reason: "Server error",
              });
              anotherUserData.socket.disconnect(true);
            }
          }
        } else {
          socket.emit("clientError", {
            reason: "You currently are searching for party",
          });
          socket.disconnect(true);
        }
      } else {
        socket.emit("clientError", {
          reason: "Invalid request without Users uuid & login",
        });
        socket.disconnect(true);
      }
    })();
  };
}

export const searchGameWebSocket = new SearchGameWebSocket();
