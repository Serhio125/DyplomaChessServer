import { Socket } from "socket.io";
import { ActiveGameModel } from "../models/active-game.model.js";
import { PartyModel } from "../models/party.model.js";
import { sequelize } from "../sequelize/sequelizeInst.js";
import { PartyMoveModel } from "../models/party-move.model.js";
import { spawn, ChildProcess } from "node:child_process";

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

interface AnalysesGameType {
  socket: Socket;
  commandsQueue: string[];
  isSearching: boolean;
  isInitializing: boolean;
  isInitialized: boolean;
  lastCommand: string;
  isClosed: boolean;
}

export class AnalysesGameWebSocket {
  analysesGame: AnalysesGameType;
  stockfish: ChildProcess;
  constructor(socket: Socket) {
    this.analysesGame = {
      socket: socket,
      commandsQueue: [],
      isInitialized: false,
      isInitializing: false,
      isSearching: false,
      lastCommand: "",
      isClosed: false,
    };
    socket.on("disconnect", (reason) => {
      console.log("socket disconnected with reason:");
      console.log("reason");
      if (this.analysesGame.isSearching) {
        this.analysesGame.commandsQueue.push("stop");
        this.analysesGame.commandsQueue.push("quit");
      } else {
        this.analysesGame.commandsQueue.push("quit");
      }
      setTimeout(this.executeCommand, 0);
    });
    socket.on("position", (data) => {
      console.log(`Get new position for analyses from client:`);
      console.log(data);
      this.analysesGame.commandsQueue = []; //TODO need TEST!! зануления очереди сообщений
      if (this.analysesGame.isSearching) {
        this.analysesGame.commandsQueue.push("stop");
      }
      if (
        this.analysesGame.isInitializing &&
        !this.analysesGame.lastCommand.includes("isready")
      ) {
        this.analysesGame.commandsQueue.push("isready");
      }
      this.analysesGame.commandsQueue.push(`ucinewgame`);
      this.analysesGame.commandsQueue.push(`position fen ${data.position}`);
      this.analysesGame.commandsQueue.push(`isready`);
      this.analysesGame.commandsQueue.push(`go depth 15`); //TODO check on lastCommand when Initializing
      setTimeout(this.executeCommand, 0);
    });
    this.stockfish = spawn(
      `D:\\Study\\Dyploma\\stockfish\\stockfish-windows-x86-64-sse41-popcnt.exe`,
    );
    this.analysesGame.commandsQueue = [
      "uci",
      "ucinewgame",
      "position",
      "isready",
    ];
    this.analysesGame.isInitializing = true;
    this.stockfish.on("error", (error) => {
      console.log(`Stockfish process ended with error:`);
      console.log(error);
      this.analysesGame.isClosed = true;
      socket.disconnect(true);
    });
    this.stockfish.on("close", () => {
      console.log(`Stockfish process closed:`);
      this.analysesGame.isClosed = true;
      socket.disconnect(true);
    });
    this.stockfish.on("exit", () => {
      console.log(`Stockfish process exiting:`);
      this.analysesGame.isClosed = true;
      socket.disconnect(true);
    });
    this.stockfish.on("spawn", () => {
      console.log("Stockfish process spawned succesed");
      this.stockfish.stdout.on("data", this.handlingData);
      setTimeout(this.executeCommand, 0);
    });
  }

  executeCommand = () => {
    const Command = () => {
      console.log(this.analysesGame.commandsQueue);
      this.analysesGame.commandsQueue =
        this.analysesGame.commandsQueue.reverse();
      console.log(this.analysesGame.commandsQueue);
      const command = this.analysesGame.commandsQueue.pop();
      if (!command) {
        return;
      }
      console.log(command);
      if (
        command.includes("ucinewgame") &&
        (this.analysesGame.isInitializing || this.analysesGame.isSearching)
      ) {
        this.analysesGame.commandsQueue.push(command);
        this.analysesGame.commandsQueue =
          this.analysesGame.commandsQueue.reverse();
        setTimeout(this.executeCommand, 0);
        return;
      }
      if (
        command.includes("go") &&
        (this.analysesGame.isInitializing || !this.analysesGame.isInitialized)
      ) {
        this.analysesGame.commandsQueue.push(command);
        this.analysesGame.commandsQueue =
          this.analysesGame.commandsQueue.reverse();
        setTimeout(this.executeCommand, 0);
        return;
      }
      if (command.includes("stop") && !this.analysesGame.isSearching) {
        this.analysesGame.commandsQueue =
          this.analysesGame.commandsQueue.reverse();
        setTimeout(this.executeCommand, 0);
        return;
      }
      if (
        command.includes("quit") &&
        (this.analysesGame.isSearching ||
          this.analysesGame.isInitializing ||
          !this.analysesGame.isInitialized)
      ) {
        this.analysesGame.commandsQueue.push(command);
        this.analysesGame.commandsQueue =
          this.analysesGame.commandsQueue.reverse();
        setTimeout(this.executeCommand, 0);
        return;
      }
      if (command.includes("position") && this.analysesGame.isSearching) {
        this.analysesGame.commandsQueue.push(command);
        this.analysesGame.commandsQueue =
          this.analysesGame.commandsQueue.reverse();
        setTimeout(this.executeCommand, 0);
        return;
      }
      this.analysesGame.commandsQueue =
        this.analysesGame.commandsQueue.reverse();
      if (!this.analysesGame.isClosed) {
        this.stockfish.stdin.write(command + "\n");
      }
      if (command.includes("go")) {
        this.analysesGame.isSearching = true;
      }
      if (command.includes("position")) {
        this.analysesGame.isInitializing = true;
        this.analysesGame.isInitialized = false;
      }
      this.analysesGame.lastCommand = command;
      //this.stockfish.stdin.write(command + "\n");
      setTimeout(this.executeCommand, 0);
    };
    //todo _____________________________________________________________________________________________________- (SEPARATOR)
    if (this.analysesGame.commandsQueue.length === 0) {
      return;
    }
    console.log(
      `commandsQueue length = ${this.analysesGame.commandsQueue.length}`,
    );
    console.log(this.analysesGame.commandsQueue);
    if (this.analysesGame.lastCommand === "") {
      setTimeout(Command, 0);
      return;
    }
    if (this.analysesGame.lastCommand === "uci") {
      setTimeout(Command, 100);
      return;
    }
    if (this.analysesGame.lastCommand.includes("position")) {
      setTimeout(Command, 100);
      return;
    }
    if (this.analysesGame.lastCommand === "isready") {
      setTimeout(Command, 100);
      return;
    }
    if (this.analysesGame.lastCommand.includes("go")) {
      setTimeout(Command, 100);
      return;
    }
    if (this.analysesGame.lastCommand === "stop") {
      setTimeout(Command, 100);
      return;
    }
    if (this.analysesGame.lastCommand === "ucinewgame") {
      setTimeout(Command, 100);
      return;
    }
    if (this.analysesGame.lastCommand === "quit") {
      this.analysesGame.isClosed = true;
      this.analysesGame.commandsQueue = [];
      return;
    }
  };
  handlingData = (dataBuffer) => {
    const data: string = dataBuffer.toString();
    console.log(data);
    if (this.analysesGame.lastCommand === "uci") {
      return;
    }
    if (data.includes("readyok")) {
      this.analysesGame.isInitializing = false;
      this.analysesGame.isInitialized = true;
      return;
    }
    if (data.includes("bestmove")) {
      const splits = data.replace(/\r/g, "").replace(/\n/g, " ").split(" ");
      console.log("splits array:");
      console.log(splits);
      this.analysesGame.socket.emit("bestmove", {
        move: splits[splits.indexOf("bestmove") + 1],
        cp: splits.includes("cp")
          ? splits[splits.indexOf("cp") + 1]
          : undefined,
        mate: splits.includes("mate")
          ? splits[splits.indexOf("mate") + 1]
          : undefined,
      });
      this.analysesGame.isSearching = false;
      return;
    }
    if (data.includes("info")) {
      console.log("Data includes info");
      console.log(parseInt(data.split(" ").at(2)));
    }
    if (data.includes("info") && parseInt(data.split(" ").at(2)) > 10) {
      const splits = data.replace(/\r/g, "").replace(/\n/g, " ").split(" ");
      this.analysesGame.socket.emit("move", {
        //move: data.split(" ").at(21),
        move: splits[splits.indexOf("pv") + 1],
        cp: splits.includes("cp")
          ? splits[splits.indexOf("cp") + 1]
          : undefined,
        mate: splits.includes("mate")
          ? splits[splits.indexOf("mate") + 1]
          : undefined,
      });
    }
  };
}
