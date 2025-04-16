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
//import { UserModel } from "./user.model.js";

@Table({
  modelName: "PartySearchModel",
  tableName: "party-searches",
  timestamps: false,
})
export class PartySearchModel extends Model<
  InferAttributes<PartySearchModel>,
  InferCreationAttributes<PartySearchModel>
> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column(DataTypes.UUID)
  uuid!: string;

  @IsUUID(4)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  userUuid!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  status!: string;

  //TODO add belongsTo(User)
  // @BelongsTo(() => UserModel, "userUuid")
  // user!: UserModel;
}
