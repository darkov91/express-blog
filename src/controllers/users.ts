import asyncHandler from "../middleware/async";
import User, { IUser } from "../models/User";
import { ErrorResponse } from "../utils/errorResponse";

// @desc    Gets a single user
// @route   GET /api/v1/users/:id
// @access  Private
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Lists all the users
// @route   GET /api/v1/users
// @access  Private
export const getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.enhancedListResult);
});

// @desc    Creates a new user
// @route   POST /api/v1/users
// @access  Private
export const createUser = asyncHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: newUser,
  });
});

// @desc    Updates a user
// @route   PUT /api/v1/users/:id
// @access  Private
export const updateUser = asyncHandler(async (req, res, next) => {
  const newUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: newUser,
  });
});

// @desc    Deletes a user
// @route   DELETE /api/v1/users/:id
// @access  Private
export const deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
  });
});
