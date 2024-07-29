import { db } from "@/utils/database/db";
import { Router } from "express";
import type { Request } from "express";

export const usersRouter = Router();

interface RegisterRequest extends Request {
	body: {
		userId: string;
		email: string;
	};
}

usersRouter.post("/register", async (req: RegisterRequest, res, next) => {
	const { userId, email } = req.body;

	if (!userId || !email) {
		return res.status(400).json({ error: "User not found" });
	}

	const user = db.createUserIfNotExists(userId, email);
	return res.json(user);
});
