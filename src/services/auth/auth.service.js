import prisma from "../../models/index.js";
import jwt from "jsonwebtoken";
import { hashPassword, verifyPassword } from "./password.service.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

export const registerUser = async ({ email, password, name }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already registered");

  const passwordHash = await hashPassword(password);

  // Use correct field names from schema
 
  const user = await prisma.user.create({
    data: { 
      email, 
      passwordHash,  // Changed from 'password'
      fullName: name  // Changed from 'name'
    },
  });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  
  // Return user without password
  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new Error("Invalid credentials");

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    message: "Login successful",
    user: userWithoutPassword,
    token,
  };
};

export const getUserById = async (id) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }, // ❌ no Number() — keep as string for UUID
      select: { id: true, fullName: true, email: true },
    });
    return user;
  } catch (err) {
    console.error("🔥 Prisma getUserById error:", err);
    throw new Error("Database error");
  }
};

