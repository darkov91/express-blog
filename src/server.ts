import express from "express";
import "colorts/lib/string";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import errorHandler from "./middleware/error";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import xssClean from "xss-clean";

// Routes
import postsRoutes from "./routes/posts";
import authRoutes from "./routes/auth";
import blogsRoutes from "./routes/blogs";
import usersRoutes from "./routes/users";
import { rateLimit } from "express-rate-limit";
import hppProtect from "./middleware/hppProtect";

// Load env vars
dotenv.config({ path: "./src/config/config.env" });

connectDB();

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

// HTTP parameter protection
app.use(hppProtect);

// Cookie parser
app.use(cookieParser());

// Setup cross origin requests
app.use(cors());

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Sanitize date
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// XSS security
app.use(xssClean());

// Mount routers
app.use("/api/v1/posts", postsRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/blogs", blogsRoutes);
app.use("/api/v1/users", usersRoutes);

app.use(errorHandler);

const PORT = process.env.PORT ?? 5000;
const server = app.listen(PORT, () =>
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server and exit process
  server.close(() => process.exit(1));
});
