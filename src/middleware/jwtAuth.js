// src/middleware/jwtAuth.js
import jwt from "jsonwebtoken";

export const jwtAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    const err = new Error("No token provided");
    err.statusCode = 401;
    err.expose = true;
    return next(err);
  }

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.id,
      email: payload.email,
    };
    return next();
  } catch (err) {
    const e = new Error("Invalid or expired token");
    e.statusCode = 401;
    e.expose = true;
    return next(e);
  }
};
