import { Redis } from "ioredis";

/**
 * @summary Used to load environment variables from a .env file into the process.env object in Node.js.
 */
require('dotenv').config();

/**
 * @summary This function returns the Redis URL if it is defined in the environment variables.
 * Otherwise, it throws an error indicating that the connection failed
 */
const redisClient = () => {
    if(process.env.REDIS_URL) {
        console.log(`Redis connected!`);
        return process.env.REDIS_URL;
    }
    throw new Error('Redis connection failed!');
};

/**
 * @summary Creates a new Redis client instance using the redisClient function.
 */
export const redis = new Redis(redisClient());

