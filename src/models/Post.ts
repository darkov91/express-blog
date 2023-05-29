import { Model, Schema, model } from "mongoose";
import { IBlogDocument } from "./Blog";

interface IPostMethods {}

export interface IPost {
  title: string;
  description: string;
  content: string;
  createdAt: string;
  blog: IBlogDocument;
}

export interface IPostDocument extends IPost, IPostMethods, Document {}

interface IPostModel extends Model<IPostDocument> {}

const PostSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add the post title"],
  },
  description: {
    type: String,
    required: [true, "Please add a post description"],
  },
  content: {
    type: String,
    required: [true, "Please write something"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  blog: {
    type: Schema.Types.ObjectId,
    ref: "Blog",
  },
});

export default model<IPost, IPostModel>("Post", PostSchema);
