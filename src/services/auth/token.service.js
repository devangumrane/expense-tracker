import jwt from "jsonwebtoken";
import prisma from "../../models/index.js";
import crypto from "crypto";

const ACCESS_EXPIRES = "15m";
const REFRESH_EXPIRES_SECONDS = 7 * 24 * 60 * 60; // 7 days in seconds
const REFRESH_EXPIRES = `${REFRESH_EXPIRES_SECONDS}s`;

const JWT_SECRET = process.env.JWT_SECRET;

function signAccessToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}

function signRefreshToken(userId) {
  // use a JWT or a random token — we'll store hashed version server-side
  const refreshToken = jwt.sign({ userId, t: crypto.randomBytes(16).toString("hex") }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES });
  return refreshToken;
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function persistRefreshToken(token, userId) {
  // store hashed token + expiry
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_SECONDS * 1000);
  const tokenHash = hashToken(token);

  const record = await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
      revoked: false,
    },
  });
  return record;
}

export async function revokeRefreshTokenByHash(token) {
  const tokenHash = hashToken(token);
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });
}

export async function revokeAllRefreshTokensForUser(userId) {
  await prisma.refreshToken.updateMany({
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
