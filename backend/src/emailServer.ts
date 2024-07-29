import nodemailer from "nodemailer";
import "dotenv/config";
import { Worker, type RedisOptions } from "bullmq";

const redisConnection: RedisOptions = {
	host: process.env.REDIS_HOST || "localhost",
	port: Number.parseInt(process.env.REDIS_PORT || "6379"),
};

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number.parseInt(process.env.SMTP_PORT || "587", 10),
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

const emailWorker = new Worker(
	"sendEmails",
	async (job) => {
		const { to, subject, text } = job.data;
		try {
			await transporter.sendMail({
				from: process.env.EMAIL_FROM,
				to,
				subject,
				text,
			});
			console.log(`Email sent to ${to}`);
		} catch (error) {
			console.error(`Failed to send email to ${to}:`, error);
		}
	},
	{ connection: redisConnection },
);

emailWorker.on("completed", (job) => {
	console.log(`Job ${job.id} has completed`);
});

emailWorker.on("failed", (job, err) => {
	// @ts-ignore
	console.log(`Job ${job.id} has failed with error ${err.message}`);
});

console.log("Email server is running");
