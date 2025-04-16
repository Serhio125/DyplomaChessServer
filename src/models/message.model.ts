import {
  AllowNull,
  BelongsTo,
  Column,
  Default,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
//import { ActiveGameModel } from "./active-game.model.js";

@Table({
  modelName: "MessageModel",
  tableName: "messages",
  timestamps: true,
})
export class MessageModel extends Model<
  InferAttributes<MessageModel>,
  InferCreationAttributes<MessageModel>
> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column(DataTypes.UUID)
  uuid!: string;

  @IsUUID(4)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  gameUuid!: string;

  @IsUUID(4)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  srcUserUuid!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  content!: string;

  @AllowNull(true)
  @Column(DataTypes.INTEGER)
  type!: number;

  @IsUUID(4)
  @AllowNull(true)
  @Column(DataTypes.UUID)
  replyMessageUuid!: string;

  //TODO belongstoGame, belongsToUser
  // @BelongsTo(() => ActiveGameModel, "gameUuid")
  // game!: ActiveGameModel;
}
