import type { RedisOptions } from "ioredis";
import { Queue, Worker } from "bullmq";
import { syncTransactions } from "@/utils/plaid/transactions";

const redisConnection: RedisOptions = {
	host: process.env.REDIS_HOST || "localhost",
	port: Number.parseInt(process.env.REDIS_PORT || "6379"),
};

const txnQueue = new Queue("syncTransactions", { connection: redisConnection });

const txnWorker = new Worker(
	"syncTransactions",
	async (job) => {
		console.log(`Processing job ${job.id}`);
		await syncTransactions(job.data.itemId);
		console.log(`Finished processing job ${job.id}`);
	},
	{ connection: redisConnection },
);

txnWorker.on("completed", (job) => {
	console.log(`Job ${job.id} has completed`);
});

txnWorker.on("failed", (job, err) => {
	// @ts-ignore
	console.log(`Job ${job.id} has failed with error ${err.message}`);
});

export { txnQueue };
