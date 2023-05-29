import { Model, Schema, model, Document, RefType, Types } from "mongoose";
import { IUserDocument, UserRole } from "./User";
import Post from "./Post";

interface IBlogMethods {
  canUserModify(user: IUserDocument): boolean;
}

export interface IBlog {
  name: string;
  description: string;
  owner: IUserDocument;
  posts: Types.ObjectId[];
  createdAt: Date;
}

export interface IBlogDocument extends IBlog, IBlogMethods, Document {}

interface IBlogModel extends Model<IBlogDocument> {}

const BlogSchema: Schema<IBlogDocument> = new Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  description: {
    type: String,
    required: [true, "Please add a name"],
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Cascade delete posts when a blog is deleted
// TODO: Check what is the deal with this type??
BlogSchema.pre<IBlog>(
  "deleteOne" as any,
  { document: true },
  async function (next) {
    await Post.deleteMany({ _id: { $in: this.posts.map(({ _id }) => _id) } });
    next();
  }
);

BlogSchema.methods.canUserModify = function (user: IUserDocument) {
  return user._id.toString() === this.owner.toString() || user.isAdmin();
};

export default model<IBlog, IBlogModel>("Blog", BlogSchema);
