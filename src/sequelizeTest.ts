import { sequelize } from "./sequelize/sequelizeInst.js";
import { UserModel } from "./models/user.model.js";
import {ActiveGameModel} from "./models/active-game.model.js";
import {AnalysesGameModel} from "./models/analyses-game.model.js";
import {GameInviteModel} from "./models/game-invite.model.js";
import {MessageModel} from "./models/message.model.js";
import {PartyModel} from "./models/party.model.js";
import {PartyMoveModel} from "./models/party-move.model.js";
import {PartySearchModel} from "./models/party-search.model.js";
import {PassHashModel} from "./models/passHash.model.js";
import {ReportModel} from "./models/report.model.js";

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Success");
  } catch (e: any) {
    console.error("Error:");
  }
  sequelize.addModels([UserModel,ActiveGameModel,AnalysesGameModel,GameInviteModel,MessageModel,PartyModel,PartyMoveModel, PartySearchModel,PassHashModel,ReportModel]);
  console.log(sequelize.models);
  await sequelize.sync();
}

console.log('start');

// testConnection().then((value) => {
//   console.log('Success');
// }).catch((reason) => {
//   console.error(`Problem: ${reason}`);
// });

export const sequelizeSyncResult = testConnection();

sequelizeSyncResult.then(() => {
  console.log('Success');
}).catch((reason) => {
  console.error(`Problem: ${reason}`);
});