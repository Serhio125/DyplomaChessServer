import {
  AllowNull,
  BelongsTo,
  Column,
  Default,
  ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from "sequelize-typescript";
import { DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
//import {UserModel} from "./user.model.js";


@Table({
  tableName: "pass-hashes",
  modelName: "passHashModel",
  timestamps: false,
})
export class PassHashModel extends Model<
  InferAttributes<PassHashModel>,
  InferCreationAttributes<PassHashModel>
> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column(DataTypes.UUID)
  uuid!: string;

  @IsUUID(4)
  @Unique(true)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  userUuid!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  passwordHash!: string;

  // @BelongsTo(() => UserModel, {
  //   onDelete: "CASCADE",
  //   onUpdate: "CASCADE",
  //   targetKey: "uuid",
  //   foreignKey: "userUuid",
  // })
  // user!: UserModel;

  // @BelongsTo(() => UserModel, "userUuid")
  // user!: UserModel;
}
