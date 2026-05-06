import { Worker } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import mailSender from '../../mailSender.js'; // Your existing email utility!

dotenv.config();

// Fail fast if the Redis URL is missing so it doesn't fall back to localhost
if (!process.env.UPSTASH_REDIS_URL) {
  throw new Error("FATAL ERROR: UPSTASH_REDIS_URL is missing in environment variables!");
}

// 2. Set up the Redis Connection (same as the queue)
const redisConnection = new Redis(process.env.UPSTASH_REDIS_URL, {
  maxRetriesPerRequest: null,
});

console.log("📨 Email worker is up and listening to Upstash Redis...");

// 3. Create the Worker
// It listens to 'email-queue' and runs this async function for every job
export const emailWorker = new Worker('email-queue', async (job) => {
  // Extract the data we passed in queueEmail({ email, title, body })
  const { email, title, body } = job.data;

  console.log(`[Worker] Starting job ${job.id} - Sending email to ${email}...`);

  // 4. Call your actual Mailjet email sender
  await mailSender(email, title, body);

}, { 
  connection: redisConnection,
  concurrency: 5 // Process up to 5 emails at the exact same time
});

// 5. Add event listeners for easy debugging
emailWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully!`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.id} failed:`, err.message);
});
