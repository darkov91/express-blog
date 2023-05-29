import { Model, Schema, model, Document } from "mongoose";
import { genSalt, hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import crypto from "crypto";

export enum UserRole {
  User = "user",
  Publisher = "publisher",
  Admin = "admin",
}

interface IUserMethods {
  getSignedJwtToken(): string;
  matchPasssword(enteredPassword: string): Promise<boolean>;
  isAdmin(): boolean;
  getResetPasswordToken(): string;
}

export interface IUser {
  name: string;
  email: string;
  role: UserRole;
  resetPasswordToken: string;
  resetPasswordExpire: number;
  password: string;
  createdAt: Date;
}

export interface IUserDocument extends IUser, IUserMethods, Document {}

interface IUserModel extends Model<IUserDocument> {}

const UserSchema: Schema<IUserDocument> = new Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a vald email",
    ],
  },
  role: {
    type: String,
    enum: [UserRole.User, UserRole.Publisher],
    default: UserRole.User,
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user enetered password to hashed password in db
UserSchema.methods.matchPasssword = function (
  enteredPassword: string
): Promise<boolean> {
  return compare(enteredPassword, this.password);
};

UserSchema.methods.isAdmin = function () {
  return this.role === UserRole.Admin;
};

UserSchema.methods.getResetPasswordToken = function (this: IUserDocument) {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set exipre
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export default model<IUser, IUserModel>("User", UserSchema);
