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
//import { UserModel } from "./user.model.js";

@Table({
  modelName: "GameInviteModel",
  tableName: "game-invites",
  timestamps: true,
})
export class GameInviteModel extends Model<
  InferAttributes<GameInviteModel>,
  InferCreationAttributes<GameInviteModel>
> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column(DataTypes.UUID)
  uuid!: string;

  @Unique
  @AllowNull(false)
  @Column(DataTypes.STRING)
  inviteContent!: string;

  @IsUUID(4)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  srcUserUuid!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  status!: string;

  //TODO belongs to user???
  // @BelongsTo(() => UserModel, "srcUserUuid")
  // srcUser!: UserModel;
}
