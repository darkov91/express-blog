import { Request, Response } from "express";
import asyncHandler from "../middleware/async";
import Post, { IPostDocument } from "../models/Post";
import { ErrorResponse } from "../utils/errorResponse";
import Blog from "../models/Blog";
import enhanceListRequest, {
  EnhancedListResponse,
} from "../middleware/enhanceListRequest";

// @desc    Gets a single post
// @route   GET /api/v1/posts/:id
export const getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate("blog");

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: post,
  });
});

// @desc    Lists all the posts in a blog
// @route   GET /api/v1/blogs/:blogId/posts
export async function getPosts(req: Request, res, next) {
  req.query.blog = req.params.blogId;

  await enhanceListRequest(Post)(req, res, next);

  res.status(200).json(res.enhancedListResult);
}

// @desc    Update a post
// @route   PUT /api/v1/posts/:id
export const updatePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate("blog");

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  if (!post.blog.canUserModify(req.user)) {
    return next(
      new ErrorResponse(
        `User cannot update the posts on blog ${post.blog._id}`,
        401
      )
    );
  }

  const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: updatedPost,
  });
});

// @desc    Create a post
// @route   POST /api/v1/blogs/:blogId/posts
export const createPost = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.blogId);

  if (!blog) {
    return next(new ErrorResponse(`Blog does not exist`, 404));
  }

  if (!blog.canUserModify(req.user)) {
    return next(
      new ErrorResponse(`User cannot update the blog ${blog._id}`, 401)
    );
  }

  const post = await Post.create({ ...req.body, blog: blog._id });

  if (!post) {
    return next(new ErrorResponse(`Failed to create a post`, 404));
  }

  await blog.updateOne({
    $push: { posts: post._id },
  });

  res.status(200).json({
    success: true,
    data: post,
  });
});
