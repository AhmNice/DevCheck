import app from "./app.js";
import config from "./config/config/config.js";
import authRouter from "./routes/auth.route.js";
import healthRouter from "./routes/health.route.js";
import { globalErrorHandler } from "./utils/errorHandler.js";

app.use("/health", healthRouter);
app.use("/api/auth", authRouter);

app.use(globalErrorHandler);
app.listen(config.PORT, () => {
  console.log(
    `Server running in ${config.NODE_ENV} mode on port ${config.PORT}`,
  );
});
