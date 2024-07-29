import { Queue, type RedisOptions } from "bullmq";

const redisConnection: RedisOptions = {
	host: process.env.REDIS_HOST || "localhost",
	port: Number.parseInt(process.env.REDIS_PORT || "6379"),
};

const txnQueue = new Queue("syncTransactions", { connection: redisConnection });

export { txnQueue };
