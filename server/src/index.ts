import passport from "passport";
import app from "./app.js";
import { pool } from "./config/db.config.js";
import { connect_database } from "./db/db_connect.js";
import { globalErrorHandler } from "./utils/errorHandler.js";
import "./auth/google_oauth.js";
import "./auth/github_oauth.js";
import config from "./config/config.js";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";

app.use(cookieParser());
app.use(passport.initialize());
app.use("/api/v1", router);
app.use(globalErrorHandler);
let server: ReturnType<typeof app.listen>;

const startServer = async () => {
  try {
    await connect_database();

    server = app.listen(config.PORT, () => {
      console.log(
        `Server running in ${config.NODE_ENV} mode on port ${config.PORT}`,
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Process Error Handlers
process.on("uncaughtException", (err: Error) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);

  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(reason);

  if (server) {
    server.close(async () => {
      await pool.end();
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Graceful Shutdown

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
});

startServer();
