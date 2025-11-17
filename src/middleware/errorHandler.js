export default function errorHandler(err, req, res, next) {
  // Log the error if logger exists
  const logger = req.app.get("logger");
  if (logger) {
    logger.error({
      message: err.message,
      stack: err.stack,
      route: req.originalUrl,
      method: req.method,
    });
  } else {
    console.error(err);
  }

  const statusCode = err.statusCode || 500;

  // For controlled errors (e.g., validation), set err.expose = true
  const message =
    err.expose || statusCode < 500
      ? err.message
      : "Internal server error";

  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
}
