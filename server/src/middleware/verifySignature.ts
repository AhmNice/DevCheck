import { Request, Response, NextFunction } from "express";
import { createHmac, timingSafeEqual } from "crypto";

export function verifySignature(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const signatureHeader =
    req.header("X-Hub-Signature-256") || req.header("x-hub-signature-256");
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    res.status(401).send("Invalid or missing signature");
    return;
  }
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    res.status(500).send("Webhook secret not configured");
    return;
  }
  const payload = Buffer.isBuffer(req.body)
    ? (req.body as Buffer)
    : Buffer.from(JSON.stringify(req.body ?? ""));
  const hmac = createHmac("sha256", secret);
  hmac.update(payload);
  const expectedSignature = Buffer.from("sha256=" + hmac.digest("hex"));
  const receivedSignature = Buffer.from(signatureHeader);
  if (
    expectedSignature.length !== receivedSignature.length ||
    !timingSafeEqual(expectedSignature, receivedSignature)
  ) {
    res.status(401).send("Signature verification failed");
    return;
  }
  next();
}
