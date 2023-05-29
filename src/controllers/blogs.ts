import { Request, Response } from "express";
import asyncHandler from "../middleware/async";
import { ErrorResponse } from "../utils/errorResponse";
import Blog from "../models/Blog";
import { EnhancedListResponse } from "../middleware/enhanceListRequest";

// @desc    Gets a single blog
// @route   GET /api/v1/blogs/:id
export const getBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id).populate("posts");

  if (!blog) {
    return next(
      new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: blog,
  });
});

// @desc    Lists all the blogs
// @route   GET /api/v1/blogs
export async function getBlogs(req: Request, res, next) {
  res.status(200).json(res.enhancedListResult);
}

// @desc    Update a blog
// @route   PUT /api/v1/blogs/:id
export const updateBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(
      new ErrorResponse(`blog not found with id of ${req.params.id}`, 404)
    );
  }

  if (!blog.canUserModify(req.user)) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update the blog`,
        401
      )
    );
  }

  const updatedBlog = await blog.updateOne(req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: updatedBlog,
  });
});

// @desc    Create a blog
// @route   POST /api/v1/blogs
export const createBlog = asyncHandler(async (req, res, next) => {
  // Check whether there already is a blog created by this user
  const existingBlog = await Blog.findOne({ owner: req.user.id });
  if (existingBlog && !req.user.isAdmin()) {
    return next(new ErrorResponse(`You already have a published blog`, 400));
  }
  const blog = await Blog.create({ ...req.body, owner: req.user.id });

  if (!blog) {
    return next(new ErrorResponse(`Failed to create a blog`, 404));
  }

  res.status(200).json({
    success: true,
    data: blog,
  });
});

// @desc    Delete a blog
// @route   DELETE /api/v1/blogs/:id
export const deleteBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(
      new ErrorResponse(`blog not found with id of ${req.params.id}`, 404)
    );
  }

  if (!blog.canUserModify(req.user)) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete the blog`,
        401
      )
    );
  }

  blog.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
