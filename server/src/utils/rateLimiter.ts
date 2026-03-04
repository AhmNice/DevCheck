import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "./errorHandler.js";

interface Bucket {
  tokens: number;
  lastRefill: number;
}
const store = new Map<string, Bucket>();
export function rateLimiter({
  maxTokens,
  refillInterval,
}: {
  maxTokens: number;
  refillInterval: number;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers["x-forwarded-for"] as string) || req.ip || "unknown";
    const now = Date.now();

    if (ip === "unknown") {
      throw new BadRequestError("Unable to determine client IP address");
    }
    let bucket = store.get(ip);

    if (!bucket) {
      bucket = {
        tokens: maxTokens,
        lastRefill: now,
      };
    }

    const timePassed = (now - bucket.lastRefill) / 1000;
    const refillTokens = Math.floor(timePassed * (maxTokens / refillInterval));
    bucket.tokens = Math.min(maxTokens, bucket.tokens + refillTokens);
    bucket.lastRefill = now;

    if (bucket.tokens < 1) {
      res.status(429).json({ error: "Too many requests" });
      return;
    }
    bucket.tokens -= 1;
    store.set(ip, bucket);
    next();
  };
}
