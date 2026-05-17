import { Router } from "express";
import { getUsers, updateUserStatus } from "../controllers/userController.js";

const router = Router();

router.get("/", getUsers);
router.patch("/:userId/status", updateUserStatus);

export default router;

