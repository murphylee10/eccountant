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

	// Find monthly subscriptions that match today's date
	const monthlySubscriptions = await prisma.subscription.findMany({
		where: {
			isUserApproved: true,
			frequency: "MONTHLY",
			dayOfMonth: dayOfMonth,
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
			dayOfMonth: 1,
			month: month,
		},
		include: {
			user: true,
		},
	});

	const allSubscriptions = [...monthlySubscriptions, ...annualSubscriptions];
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

// Schedule the cron job to run every day at midnight
cron.schedule("0 0 * * *", () => {
	console.log("Running cron job at midnight");
	checkSubscriptions().catch((err) => {
		console.error("Error checking subscriptions:", err);
	});
});

console.log("Cron server is running");
