import { db } from "@/utils/database/db";
import { Router } from "express";
import type { Request } from "express";

export const usersRouter = Router();

interface RegisterRequest extends Request {
  body: {
    userId: string;
  };
}

usersRouter.post("/register", async (req: RegisterRequest, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID not found" });
  }

  const user = db.createUserIfNotExists(userId);
  return res.json(user);
});
