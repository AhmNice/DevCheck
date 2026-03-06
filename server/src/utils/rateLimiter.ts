import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "./errorHandler.js";

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const BUCKET_TTL = 15 * 60 * 1000;

export function rateLimiter({
  maxTokens,
  refillInterval,
}: {
  maxTokens: number;
  refillInterval: number; // in seconds
  limiterId?: string;
}) {
  // Each limiter instance has its own store
  const store = new Map<string, Bucket>();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers["x-forwarded-for"] as string) || req.ip || "unknown";
    if (ip === "unknown") {
      throw new BadRequestError("Unable to determine client IP address");
    }

    const key = `${ip}:${req.path}`;
    const now = Date.now();

    let bucket = store.get(key);

    // Evict old bucket if it has been inactive
    if (bucket && now - bucket.lastRefill > BUCKET_TTL) {
      bucket = undefined;
    }

    if (!bucket) {
      bucket = { tokens: maxTokens, lastRefill: now };
    }

    // Refill tokens based on time passed
    const timePassed = (now - bucket.lastRefill) / 1000;
    const refillTokens = Math.floor(timePassed * (maxTokens / refillInterval));
    bucket.tokens = Math.min(maxTokens, bucket.tokens + refillTokens);
    bucket.lastRefill = now;

    // Check token availability
    if (bucket.tokens < 1) {
      res.status(429).json({ error: "Too many requests" });
      return;
    }

    bucket.tokens -= 1;
    store.set(key, bucket);

    next();
  };
}
