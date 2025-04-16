import {
  AllowNull,
  BelongsTo,
  Column,
  Default,
  HasOne,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
import { PartyModel } from "./party.model.js";
//import { UserModel } from "./user.model.js";
//import { ActiveGameModel } from "./active-game.model.js";

@Table({
  modelName: "AnalysesGameModel",
  tableName: "analyses-games",
  timestamps: false,
})
export class AnalysesGameModel extends Model<
  InferAttributes<AnalysesGameModel>,
  InferCreationAttributes<AnalysesGameModel>
> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column(DataTypes.UUID)
  uuid!: string;

  @IsUUID(4)
  @AllowNull(true)
  @Column(DataTypes.UUID)
  activeGameUuid!: string;

  @IsUUID(4)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  userUuid!: string;

  //TODO add hasOne(party), belongsTo(user)/(activeGame)
  @HasOne(() => PartyModel, "analysesGameUuid")
  party!: PartyModel;

  // @BelongsTo(() => UserModel, "userUuid")
  // user!: UserModel;
  //
  // @BelongsTo(() => ActiveGameModel, "activeGameUuid")
  // activeGame!: ActiveGameModel;
}
