import {
  registerUser as registerUserService,
  loginUser as loginUserService,
} from "../services/auth/auth.service.js";
import {
  findRefreshTokenRecord,
  revokeRefreshTokenByHash,
  revokeAllRefreshTokensForUser,
  signAccessToken,
  signRefreshToken,
  persistRefreshToken,
} from "../services/auth/token.service.js";
import jwt from "jsonwebtoken";

const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

// ------------------------------
// Register
// ------------------------------
export const registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const result = await registerUserService({ email, password, name });

    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error("REGISTER ERROR:", error.message);
  }
};

// ------------------------------
// Login
// ------------------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const result = await loginUserService({ email, password });

    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// ------------------------------
// Get Current User
// ------------------------------
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await getUserById(userId);
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ------------------------------
// Refresh Access Token
// ------------------------------
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken =
      req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
    if (!refreshToken)
      return res.status(400).json({ message: "Refresh token required" });

    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const tokenRecord = await findRefreshTokenRecord(refreshToken);
    if (!tokenRecord)
      return res.status(401).json({ message: "Token invalid or revoked" });

    await revokeRefreshTokenByHash(refreshToken);

    const newAccessToken = signAccessToken(payload.userId);
    const newRefreshToken = signRefreshToken(payload.userId);
    await persistRefreshToken(newRefreshToken, payload.userId);

    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, REFRESH_COOKIE_OPTIONS);

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------
// Logout (current device)
// ------------------------------
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken)
      return res.status(400).json({ message: "Refresh token required" });

    await revokeRefreshTokenByHash(refreshToken);
    res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------
// Logout All (all devices)
// ------------------------------
export const logoutAll = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await revokeAllRefreshTokensForUser(userId);
    res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
    res.json({ message: "Logged out from all devices" });
  } catch (error) {
    console.error("Logout-all error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
