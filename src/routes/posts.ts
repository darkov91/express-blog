import {
  createPost,
  getPost,
  getPosts,
  updatePost,
} from "../controllers/posts";

import express from "express";
import { protect, authorize } from "../middleware/auth";
import { UserRole } from "../models/User";
import enhanceListRequest from "../middleware/enhanceListRequest";
import Post from "../models/Post";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(protect, authorize([UserRole.Publisher, UserRole.Admin]), createPost)
  .get(enhanceListRequest(Post), getPosts);

router
  .route("/:id")
  .get(getPost)
  .put(protect, authorize([UserRole.Publisher, UserRole.Admin]), updatePost);

export default router;
