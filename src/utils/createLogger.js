import winston from "winston";
import path from "path";
import fs from "fs";

export default function createLogger() {
  const logDir = path.resolve("logs");
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.File({
        filename: `${logDir}/error.log`,
        level: "error",
      }),
      new winston.transports.File({
        filename: `${logDir}/combined.log`,
        level: "info",
      }),
    ],
  });

  // Pretty console logs for DEV
  if (process.env.NODE_ENV !== "production") {
    logger.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.printf(
            (info) => `${info.timestamp} - ${info.level}: ${info.message}`
          )
        ),
      })
    );
  }

  return logger;
}
