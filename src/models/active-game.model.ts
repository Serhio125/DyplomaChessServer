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
//import { UserModel } from "./user.model.js";
import { MessageModel } from "./message.model.js";
import { PartyModel } from "./party.model.js";

@Table({
  modelName: "ActiveGameModel",
  tableName: "active-games",
  timestamps: false,
})
export class ActiveGameModel extends Model<
  InferAttributes<ActiveGameModel>,
  InferCreationAttributes<ActiveGameModel>
> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column(DataTypes.UUID)
  uuid!: string;

  @IsUUID(4)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  userWUuid!: string;

  @IsUUID(4)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  userBUuid!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  status!: string;

  //TODO add HasOne(Party), HasMany(Messages)
  // @BelongsTo(() => UserModel, "userWUuid")
  // userW!: UserModel;
  //
  // @BelongsTo(() => UserModel, "userBUuid")
  // userB!: UserModel;

  @HasMany(() => MessageModel, "gameUuid")
  messages!: MessageModel[];

  @HasOne(() => PartyModel, "activeGameUuid")
  party!: PartyModel;
}
