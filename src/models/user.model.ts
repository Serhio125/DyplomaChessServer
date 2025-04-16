import {
  AllowNull,
  Column,
  Default,
  HasMany,
  HasOne,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from "sequelize-typescript";
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { PassHashModel } from "./passHash.model.js";
import { GameInviteModel } from "./game-invite.model.js";
import { ActiveGameModel } from "./active-game.model.js";
import { MessageModel } from "./message.model.js";
import { AnalysesGameModel } from "./analyses-game.model.js";
import { PartySearchModel } from "./party-search.model.js";
import { ReportModel } from "./report.model.js";
import { PartyModel } from "./party.model.js";
@Table({
  modelName: "UserModel",
  tableName: "users",
  timestamps: false,
})
export class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column(DataTypes.UUID)
  uuid!: CreationOptional<string>;

  @Unique(true)
  @AllowNull(false)
  @Column(DataTypes.STRING)
  login!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  role!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING)
  firstName!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING)
  lastName!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING)
  country!: string;

  @HasOne(() => PassHashModel, "userUuid")
  passHash!: PassHashModel;
  //TODO add hasMany(), HasOne();

  @HasMany(() => GameInviteModel, "srcUserUuid")
  invites!: GameInviteModel[];

  @HasMany(() => ActiveGameModel, "userWUuid")
  activeGamesW!: ActiveGameModel[];

  @HasMany(() => ActiveGameModel, "userBUuid")
  activeGamesB!: ActiveGameModel[];

  @HasMany(() => MessageModel, "srcUserUuid")
  outgoingMessages!: MessageModel[];

  @HasOne(() => AnalysesGameModel, "userUuid")
  analysesGame!: AnalysesGameModel;

  @HasOne(() => PartySearchModel, "userUuid")
  partySearch!: PartySearchModel;

  @HasMany(() => ReportModel, "adminUuid")
  currentReports!: ReportModel[];

  @HasMany(() => ReportModel, "srcUserUuid")
  outgoingReports!: ReportModel[];

  @HasMany(() => ReportModel, "dstUserUuid")
  incomingReports!: ReportModel[];
}
