import express from "express";
import { BadRequestError } from "../utils/errorHandler.js";
import { sendWelcomeEmail } from "../mail/service.js";

const testRouter = express.Router();

testRouter.post("/test-email", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    throw new BadRequestError("Missing required fields: name and email");
  }
  await sendWelcomeEmail({ name, email });
  res.json({ message: "Test email route is working!" });
});

export default testRouter;
