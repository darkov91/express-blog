import express from "express";
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "../controllers/users";
import { authorize, protect } from "../middleware/auth";
import User, { UserRole } from "../models/User";
import enhanceListRequest from "../middleware/enhanceListRequest";

const router = express.Router();

router.use(protect).use(authorize([UserRole.Admin]));

router.route("/").get(enhanceListRequest(User), getUsers).post(createUser);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

export default router;
