import express, { Express } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { UserModel } from "./models/user.model.js";
import { sequelizeSyncResult } from "./sequelizeTest.js";
import { PassHashModel } from "./models/passHash.model.js";
import pkg from "bcryptjs";
import { AuthEndPoint } from "./endPoints/auth.endPoint.js";
import { AuthCookieMiddleware } from "./middlewares/authCookie.Middleware.js";
import { RegistrEndPoint } from "./endPoints/registr.endPoint.js";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { searchGameWebSocket } from "./webSockets/search-game.webSocket.js";
import { CheckTokenMiddleware } from "./middlewares/checkToken.Middleware.js";
import { LoadActivePartyEndPoint } from "./endPoints/loadActiveParty.endPoint.js";
import { activeGameWebSocket } from "./webSockets/active-game.webSocket.js";
import { AnalysesGameWebSocket } from "./webSockets/analyses-game.webSocket.js";
import { GetActiveParties } from "./endPoints/getActiveParties.js";
import { GetFinishedParties } from "./endPoints/getFinishedParties.js";
import { GetActiveReportsEndPoint } from "./endPoints/getActiveReports.endPoint.js";
import { GetResolvedReportsEndPoint } from "./endPoints/getResolvedReports.endPoint.js";
import { LoadActiveReportEndPoint } from "./endPoints/loadActiveReport.endPoint.js";
import { SetReportDecisionEndPoint } from "./endPoints/setReportDecision.endPoint.js";
import { AcceptGameInviteEndPoint } from "./endPoints/acceptGameInvite.endPoint.js";
const { hashSync } = pkg;
const app: Express = express();
const wsServer = createServer(app);
const io = new Server(wsServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  console.log("Get request");
  console.log(req.cookies);
  res.cookie("TestCookie", "wqerty", {
    domain: "localhost",
    maxAge: 1000 * 200,
  });
  res.json(
    JSON.stringify({
      hello: "world",
    }),
  );
});

app.post("/auth", AuthCookieMiddleware, AuthEndPoint);
app.post("/registr", RegistrEndPoint);
app.post("/loadActiveGame", CheckTokenMiddleware, LoadActivePartyEndPoint);
app.post("/getActiveGames", CheckTokenMiddleware, GetActiveParties);
app.post("/getFinishedGames", CheckTokenMiddleware, GetFinishedParties);
app.post("/getActiveReports", CheckTokenMiddleware, GetActiveReportsEndPoint);
app.post("/loadActiveReport", CheckTokenMiddleware, LoadActiveReportEndPoint);
app.post("/setReportDecision", CheckTokenMiddleware, SetReportDecisionEndPoint);
app.post(
  "/getResolvedReports",
  CheckTokenMiddleware,
  GetResolvedReportsEndPoint,
);
app.post("/acceptGameInvite", CheckTokenMiddleware, AcceptGameInviteEndPoint);
io.on("connect", (socket) => {
  console.log("New connect for webSocket");
  const authToken = socket.handshake.auth?.token;
  console.log(authToken);
  if (socket.handshake.query.event === "search") {
    try {
      const payload = jwt.verify(authToken, "secret") as jwt.JwtPayload;
      if (socket.handshake.query.login && socket.handshake.query.uuid) {
        searchGameWebSocket.addUserToQueue(socket, {
          uuid: socket.handshake.query.uuid as string,
          login: socket.handshake.query.login as string,
        });
      } else {
        console.log(`Empty query.login or query.uuid`);
        socket.emit("Error", "Invalid userData send");
        socket.disconnect(true);
      }
    } catch (e: any) {
      console.log(`Error when verify JWT-token`);
      socket.emit("Error", "Invalid JWT-token");
      socket.disconnect(true);
    }
    return;
  }
  if (socket.handshake.query.event === "activeGame") {
    try {
      const payload = jwt.verify(authToken, "secret") as jwt.JwtPayload;
      if (socket.handshake.query.userUuid && socket.handshake.query.gameUuid) {
        activeGameWebSocket.addUserToQueue(socket, {
          userUuid: socket.handshake.query.userUuid as string,
          gameUuid: socket.handshake.query.gameUuid as string,
        });
      } else {
        console.log(`Empty query.userUuid or query.gameUuid`);
        socket.emit("Error", "Invalid userData send");
        socket.disconnect(true);
      }
    } catch (e: any) {
      console.log(`Error when verify JWT-token`);
      socket.emit("Error", "Invalid JWT-token");
      socket.disconnect(true);
    }
    return;
  }
  if (socket.handshake.query.event === "analysesGame") {
    try {
      //const payload = jwt.verify(authToken, "secret") as jwt.JwtPayload;
      console.log("New client for analyses party, credentials:");
      //console.log(payload);
      new AnalysesGameWebSocket(socket);
    } catch (e: any) {
      console.log(`Error when verify JWT-token`);
      socket.emit("Error", "Invalid JWT-token");
      socket.disconnect(true);
    }
    return;
  }
  socket.emit("Error", "Invalid event");
  socket.disconnect(true);
});

wsServer.listen(3005);

app.listen(8080, () => {
  console.log("Server started");
});

sequelizeSyncResult
  .then(() => {
    (async () => {
      // try {
      //   let user = await UserModel.create({
      //     login: "user1",
      //     role: "User",
      //     firstName: "Name",
      //     lastName: "LastName",
      //     country: "Belarus",
      //   });
      //   let passHash = await PassHashModel.create({
      //     userUuid: user.uuid,
      //     passwordHash: hashSync("password", 3),
      //   });
      //   console.log("First user successes created");
      // } catch (e: any) {
      //   console.log(`Error when created User: ${e}`);
      // }
      try {
        console.log(
          (
            await UserModel.findAll({
              include: [
                {
                  association: "passHash",
                },
              ],
            })
          ).at(0),
        );
      } catch (e: any) {
        console.error(`Error when user find with passHash: ${e}`);
      }
    })();
  })
  .catch((reason) => {
    console.log(`Error when sync with DB: ${reason}`);
  });
