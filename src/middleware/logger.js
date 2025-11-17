import morgan from "morgan";
import fs from "fs";
import path from "path";

export default function logger(app, winstonLogger) {
  // Attach winston logger to app for errorHandler usage
  app.set("logger", winstonLogger);

  const logDir = path.resolve("logs");
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

  // Write HTTP logs to access.log
  const accessLogStream = fs.createWriteStream(
    path.join(logDir, "access.log"),
    { flags: "a" }
  );

  // Detailed logs in production
  app.use(
    morgan("combined", {
      stream: accessLogStream,
    })
  );

  // Developer-friendly logs in dev
  if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
  }
}
