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
	const dayOfMonth = 23; // Set to 23 for testing purposes
	const month = today.getMonth() + 1; // JavaScript months are 0-based

	// Find monthly subscriptions that match today's date (dayOfMonth set to 23 for testing)
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
	console.log("Found subscriptions:", allSubscriptions);
	for (const sub of allSubscriptions) {
		console.log("Sending email to", sub.user.email);
		if (sub.user.email) {
			await emailQueue.add("sendEmail", {
				to: sub.user.email,
				subject: "Subscription Notification",
				text: `Hi ${sub.user.email}!\n\n A friendly reminder that your subscription for ${sub.name} is due soon. \n\n Visit https://eccountant.live for more details. \n\n Best, \n Eccountant Team`,
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
