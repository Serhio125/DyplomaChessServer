import {
  AllowNull,
  BelongsTo,
  Column,
  Default,
  HasMany,
  HasOne,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
import { PartyMoveModel } from "./party-move.model.js";
//import { ActiveGameModel } from "./active-game.model.js";
//import { AnalysesGameModel } from "./analyses-game.model.js";

@Table({
  modelName: "PartyModel",
  tableName: "parties",
  timestamps: false,
})
export class PartyModel extends Model<
  InferAttributes<PartyModel>,
  InferCreationAttributes<PartyModel>
> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column(DataTypes.UUID)
  uuid!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  currentPos!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING)
  startPos!: string;

  @IsUUID(4)
  @AllowNull(true)
  @Column(DataTypes.UUID)
  lastMoveUuid!: string;

  @IsUUID(4)
  @AllowNull(true)
  @Column(DataTypes.UUID)
  activeGameUuid!: string;

  @IsUUID(4)
  @AllowNull(true)
  @Column(DataTypes.UUID)
  analysesGameUuid!: string;

  //TODO add belongsTo for move, active/analyesGame, hasMany moves
  @HasMany(() => PartyMoveModel, "partyUuid")
  partyMoves!: PartyMoveModel[];

  // @BelongsTo(() => PartyMoveModel, "lastMoveUuid")
  // lastMove!: PartyMoveModel;
  //
  // @BelongsTo(() => ActiveGameModel, "activeGameUuid")
  // activeGame!: ActiveGameModel;
  //
  // @BelongsTo(() => AnalysesGameModel, "analysesGameUuid")
  // analysesGame!: AnalysesGameModel;
}
