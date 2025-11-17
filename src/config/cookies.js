// src/config/cookies.js

export const REFRESH_COOKIE_NAME =
  process.env.REFRESH_COOKIE_NAME || "refreshToken";

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // must be true when on HTTPS
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/", // cookie available everywhere
};
