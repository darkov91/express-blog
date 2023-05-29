import {
  createBlog,
  getBlog,
  getBlogs,
  updateBlog,
  deleteBlog,
} from "../controllers/blogs";

import express from "express";
import { protect, authorize } from "../middleware/auth";
import { UserRole } from "../models/User";
import postsRoutes from "../routes/posts";
import enhanceListRequest from "../middleware/enhanceListRequest";
import Blog from "../models/Blog";

const router = express.Router();

router.use("/:blogId/posts", postsRoutes);

router
  .route("/")
  .post(protect, authorize([UserRole.Admin, UserRole.Publisher]), createBlog)
  .get(enhanceListRequest(Blog), getBlogs);

router
  .route("/:id")
  .get(getBlog)
  .put(protect, authorize([UserRole.Publisher, UserRole.Admin]), updateBlog)
  .delete(protect, authorize([UserRole.Publisher, UserRole.Admin]), deleteBlog);

export default router;
