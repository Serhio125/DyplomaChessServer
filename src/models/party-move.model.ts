import {
  AllowNull,
  BelongsTo,
  Column,
  Default,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from "sequelize-typescript";
import { DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
//import { PartyModel } from "./party.model.js";

@Table({
  modelName: "PartyMoveModel",
  tableName: "party-moves",
  timestamps: false,
})
export class PartyMoveModel extends Model<
  InferAttributes<PartyMoveModel>,
  InferCreationAttributes<PartyMoveModel>
> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column(DataTypes.UUID)
  uuid!: string;

  @IsUUID(4)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  partyUuid!: string;

  @AllowNull(false)
  @Column(DataTypes.INTEGER)
  index!: number;

  @AllowNull(true)
  @Column(DataTypes.STRING)
  before!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING)
  after!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING(2))
  color!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING(2))
  piece!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING(5))
  from!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING(5))
  to!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING(10))
  san!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING(10))
  lan!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING(5))
  flags!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING(5))
  captured!: string;

  //TODO belongsTo(Party)
  // @BelongsTo(() => PartyModel, "partyUuid")
  // party!: PartyModel;
}
