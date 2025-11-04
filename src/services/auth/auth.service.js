import prisma from "../../models/index.js";
import { hashPassword, verifyPassword } from "./password.service.js";
import {
  signAccessToken,
  signRefreshToken,
  persistRefreshToken,
} from "./token.service.js";

export const registerUser = async ({ email, password, name }) => {
  const emailNormalized = email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: emailNormalized },
  });
  if (existing) throw new Error("Email already registered");

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: emailNormalized,
      passwordHash,
      fullName: name,
    },
  });

  // Generate tokens right after registration (for controller compatibility)
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  await persistRefreshToken(refreshToken, user.id);

  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

export const loginUser = async ({ email, password }) => {
  console.log("🔍 Login attempt:", email, password);

  const emailNormalized = email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: emailNormalized },
  });

  console.log("🧠 Found user:", user);
  if (!user) throw new Error("Invalid credentials");

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new Error("Invalid credentials");

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  await persistRefreshToken(refreshToken, user.id);

  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    message: "Login successful",
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};
