// src/services/auth/token.service.js
import jwt from "jsonwebtoken";
import prisma from "../../models/index.js";
import crypto from "crypto";

const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES || "15m";
const REFRESH_EXPIRES_SECONDS = 7 * 24 * 60 * 60; // 7 days
const REFRESH_EXPIRES = `${REFRESH_EXPIRES_SECONDS}s`;

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;

function signAccessToken(user) {
  // user: { id, email }
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}

function signRefreshToken(user) {
  // include a jti for uniqueness
  const jti = crypto.randomBytes(16).toString("hex");
  return jwt.sign({ id: user.id, jti }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Persist hashed refresh token record
export async function persistRefreshToken(token, userId) {
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_SECONDS * 1000);
  return prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
      revoked: false,
    },
  });
}

export async function revokeRefreshTokenByHash(token) {
  const tokenHash = hashToken(token);
  return prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });
}

export async function revokeAllRefreshTokensForUser(userId) {
  return prisma.refreshToken.updateMany({
    where: { userId },
    data: { revoked: true },
  });
}

export async function findRefreshTokenRecord(token) {
  const tokenHash = hashToken(token);
  return prisma.refreshToken.findFirst({
    where: { tokenHash },
  });
}

export { signAccessToken, signRefreshToken, hashToken };
