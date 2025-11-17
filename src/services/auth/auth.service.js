// src/services/auth/auth.service.js
import prisma from "../../models/index.js";
import { hashPassword, verifyPassword } from "./password.service.js";
import { signAccessToken, signRefreshToken } from "./token.service.js";

/**
 * registerUser: creates user, returns user + tokens (does NOT persist refresh token)
 */
export const registerUser = async ({ email, password, name }) => {
  const emailNormalized = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: emailNormalized } });
  if (existing) {
    const err = new Error("Email already registered");
    err.statusCode = 400;
    throw err;
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: emailNormalized,
      passwordHash,
      fullName: name,
    },
  });

  const userDto = { id: user.id, email: user.email, fullName: user.fullName };

  const accessToken = signAccessToken(userDto);
  const refreshToken = signRefreshToken(userDto);

  return { user: userDto, accessToken, refreshToken };
};

/**
 * loginUser: validate credentials, return user + tokens (does NOT persist refresh token)
 */
export const loginUser = async ({ email, password }) => {
  const emailNormalized = email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: emailNormalized } });
  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const userDto = { id: user.id, email: user.email, fullName: user.fullName };
  const accessToken = signAccessToken(userDto);
  const refreshToken = signRefreshToken(userDto);

  return { user: userDto, accessToken, refreshToken };
};
