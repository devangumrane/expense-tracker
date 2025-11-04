import jwt from "jsonwebtoken";
import { signAccessToken, signRefreshToken, findRefreshTokenRecord, persistRefreshToken, revokeRefreshTokenByHash } from "../services/auth/token.service.js";
import prisma from "../models/index.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const JWT_SECRET = process.env.JWT_SECRET;

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

    // find DB record
    const record = await findRefreshTokenRecord(refreshToken);
    if (!record || record.revoked) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // verify the refresh token signature and get the payload
    let payload;
    try {
      payload = jwt.verify(refreshToken, JWT_SECRET);
    } catch (err) {
      // revoke DB token if signature invalid
      await revokeRefreshTokenByHash(refreshToken);
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const userId = payload.userId;
    // rotate: revoke current token, issue a new one
    await revokeRefreshTokenByHash(refreshToken);

    const newRefreshToken = signRefreshToken(userId);
    await persistRefreshToken(newRefreshToken, userId);

    const newAccessToken = signAccessToken(userId);

    // set cookie for new refresh token
    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh token error:", err);
    return res.status(500).json({ error: "Failed to refresh token" });
  }
};
