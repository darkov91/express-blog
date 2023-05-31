import { ErrorResponse } from "../utils/errorResponse";

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  // Log to console for dev
  console.log(err.message.red);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val: Error) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: err.message || "Server Error" });
};

export default errorHandler;
