// 1. Import necessary libraries
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';

// Load our environment variables so we can access UPSTASH_REDIS_URL
dotenv.config();

// Fail fast if the Redis URL is missing so it doesn't fall back to localhost
if (!process.env.UPSTASH_REDIS_URL) {
  throw new Error("FATAL ERROR: UPSTASH_REDIS_URL is missing in environment variables!");
}

// 2. Set up the Redis Connection
// BullMQ requires 'maxRetriesPerRequest' to be strictly set to null
// We pass our Upstash URL directly into the Redis constructor
const redisConnection = new Redis(process.env.UPSTASH_REDIS_URL, {
  maxRetriesPerRequest: null,
});

// 3. Initialize the Queue
// The first argument 'email-queue' is the name of our queue. 
// We pass our Upstash Redis connection so the queue knows where to store the jobs.
export const emailQueue = new Queue('email-queue', {
  connection: redisConnection,
});

// 4. Create a reusable helper function to add jobs
// Any time a user pays or needs an email, we call this function!
export const queueEmail = async (emailData) => {
  // .add() takes three arguments: 
  // 1. A string name for the job
  // 2. The payload/data
  // 3. Configuration options (retries, delays, cleanup)
  const job = await emailQueue.add('send-email', emailData, {
    attempts: 3, // If the email fails to send, try up to 3 times
    backoff: {
      type: 'exponential',
      delay: 5000, // Wait 5 seconds before 1st retry, 10s for 2nd, etc.
    },
    removeOnComplete: true, // IMPORTANT: Delete the job from Redis when done to save memory
    removeOnFail: false, // Keep permanently failed jobs so you can inspect them later
  });
  
  console.log(`Successfully added job to queue! Job ID: ${job.id}`);
};
