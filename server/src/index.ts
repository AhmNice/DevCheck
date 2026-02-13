import app from "./app.js";
import config from "./config/config/config.js";
import healthRouter from "./routes/health.route.js";

app.use("/health", healthRouter);
app.listen(config.PORT, () => {
  console.log(
    `Server running in ${config.NODE_ENV} mode on port ${config.PORT}`,
  );
});
