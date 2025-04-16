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
import { ActiveGameModel } from "./active-game.model.js";
//import { UserModel } from "./user.model.js";
//import { ActiveGameModel } from "./active-game.model.js";

@Table({
  modelName: "ReportModel",
  tableName: "reports",
  timestamps: true,
})
export class ReportModel extends Model<
  InferAttributes<ReportModel>,
  InferCreationAttributes<ReportModel>
> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column(DataTypes.UUID)
  uuid!: string;

  @IsUUID(4)
  @AllowNull(true)
  @Column(DataTypes.UUID)
  adminUuid!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  status!: string;

  @IsUUID(4)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  srcUserUuid!: string;

  @IsUUID(4)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  dstUserUuid!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  describe!: string;

  @IsUUID(4)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  activeGameUuid!: string;
  //TODO belongsTo(User/activeGame)
  // @BelongsTo(() => UserModel, "adminUuid")
  // admin!: UserModel;
  //
  // @BelongsTo(() => UserModel, "srcUserUuid")
  // srcUser!: UserModel;
  //
  // @BelongsTo(() => UserModel, "dstUserUuid")
  // dstUser!: UserModel;
  //
  @BelongsTo(() => ActiveGameModel, "activeGameUuid")
  activeGame!: ActiveGameModel;
}
