import { Redis } from "ioredis"

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"

let cachedRedis: Redis | null = null

export async function getRedisClient(): Promise<Redis> {
  if (cachedRedis) {
    return cachedRedis
  }

  const redis = new Redis(REDIS_URL)
  cachedRedis = redis

  return redis
}
