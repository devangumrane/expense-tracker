// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import passport from "passport";
import responseFormatter from "./middleware/responseFormatter.js";
import errorHandler from "./middleware/errorHandler.js";
import createLogger from "./utils/createLogger.js";
import loggerMiddleware from "./middleware/logger.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import router from "./routes/v1/index.js";

dotenv.config();
const app = express();

const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173"];

// logger
const winstonLogger = createLogger();
loggerMiddleware(app, winstonLogger);

// core middleware
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(helmet());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// rate limit
app.use("/api", apiLimiter);

// response formatter
app.use(responseFormatter);

// mount versioned router (correct way)
app.use("/api/v1", router);

// error handler LAST
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => winstonLogger.info(`Server listening on ${PORT}`));
