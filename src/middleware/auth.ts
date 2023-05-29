import jwt, { JwtPayload } from "jsonwebtoken";
import asyncHandler from "./async";
import { ErrorResponse } from "../utils/errorResponse";
import User, { IUserDocument, UserRole } from "../models/User";
import { Request } from "express";

export const protect = asyncHandler(
  async (req: Request & { user: IUserDocument }, res, next) => {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure that the token exists
    if (!token) {
      return next(new ErrorResponse("Not authorized", 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      req.user = await User.findById(decoded.id);
      next();
    } catch (err) {
      return next(new ErrorResponse("Not authorized", 401));
    }
  }
);

// Check if the user has a role
export function authorize(roles: UserRole[]) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
}
