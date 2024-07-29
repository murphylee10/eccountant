import { Queue, type RedisOptions } from "bullmq";
import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

const redisConnection: RedisOptions = {
	host: process.env.REDIS_HOST || "localhost",
	port: Number.parseInt(process.env.REDIS_PORT || "6379"),
};

const emailQueue = new Queue("sendEmails", { connection: redisConnection });

async function checkSubscriptions() {
	const today = new Date();
	const dayOfMonth = today.getDate(); // Get current day of the month
	const month = today.getMonth() + 1; // JavaScript months are 0-based

	// Determine if today is the last day of the month
	const isLastDayOfMonth =
		new Date(today.getFullYear(), month, 0).getDate() === dayOfMonth;

	// Find monthly subscriptions that match today's date or the last day of the month
	const monthlySubscriptions = await prisma.subscription.findMany({
		where: {
			isUserApproved: true,
			frequency: "MONTHLY",
			dayOfMonth: isLastDayOfMonth ? { gte: dayOfMonth } : dayOfMonth,
		},
		include: {
			user: true,
		},
	});

	// Find annual subscriptions that match today's date and month
	const annualSubscriptions = await prisma.subscription.findMany({
		where: {
			isUserApproved: true,
			frequency: "ANNUALLY",
			dayOfMonth: isLastDayOfMonth ? { gte: 1 } : 1,
			month: month,
		},
		include: {
			user: true,
		},
	});

	const allSubscriptions = [...monthlySubscriptions, ...annualSubscriptions];
	console.log("Found subscriptions:", allSubscriptions);
	for (const sub of allSubscriptions) {
		console.log("Sending email to", sub.user.email);
		if (sub.user.email) {
			await emailQueue.add("sendEmail", {
				to: sub.user.email,
				subject: "Subscription Notification",
				text: `Hi ${sub.user.email}!\n\nA friendly reminder that your subscription for ${sub.name} is due soon.\n\nVisit https://eccountant.live for more details.\n\nBest,\nEccountant Team`,
			});
		}
	}
}

// Schedule the cron job to run every minute for testing purposes
cron.schedule("* * * * *", () => {
	console.log("Running cron job every minute for testing");
	checkSubscriptions().catch((err) => {
		console.error("Error checking subscriptions:", err);
	});
});

console.log("Cron server is running");
