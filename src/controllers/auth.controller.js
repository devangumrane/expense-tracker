// src/controllers/auth.controller.js

import {
  registerUser as registerUserService,
  loginUser as loginUserService,
} from "../services/auth/auth.service.js";

import {
  persistRefreshToken,
  findRefreshTokenRecord,
  revokeRefreshTokenByHash,
  revokeAllRefreshTokensForUser,
  signAccessToken,
  signRefreshToken, // ✔ missing earlier
} from "../services/auth/token.service.js";

import prisma from "../models/index.js";
import jwt from "jsonwebtoken";

import {
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_OPTIONS,
} from "../config/cookies.js";  // ✔ single source of cookie config

//------------------------------------------------------------
// REGISTER
//------------------------------------------------------------
export const registerUser = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const result = await registerUserService({ email, password, name });

    // Persist refresh token server-side
    if (result.refreshToken) {
      await persistRefreshToken(result.refreshToken, result.user.id);
      res.cookie(
        REFRESH_COOKIE_NAME,
        result.refreshToken,
        REFRESH_COOKIE_OPTIONS
      );
    }

    return res.success(
      { user: result.user, accessToken: result.accessToken },
      "Registered",
      201
    );
  } catch (error) {
    req.app.get("logger")?.error({ message: error.message, stack: error.stack });
    const err = new Error(error.message || "Registration failed");
    err.statusCode = error.statusCode || 400;
    err.expose = true;
    return next(err);
  }
};

//------------------------------------------------------------
// LOGIN
//------------------------------------------------------------
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error("Email and password are required");
      err.statusCode = 400;
      err.expose = true;
      return next(err);
    }

    const result = await loginUserService({ email, password });

    if (result.refreshToken) {
      await persistRefreshToken(result.refreshToken, result.user.id);
      res.cookie(
        REFRESH_COOKIE_NAME,
        result.refreshToken,
        REFRESH_COOKIE_OPTIONS
      );
    }

    return res.success(
      { user: result.user, accessToken: result.accessToken },
      "Logged in"
    );
  } catch (error) {
    req.app
      .get("logger")
      ?.error({ message: error.message, stack: error.stack });
    const err = new Error(error.message || "Invalid credentials");
    err.statusCode = error.statusCode || 401;
    err.expose = true;
    return next(err);
  }
};

//------------------------------------------------------------
// GET CURRENT USER
//------------------------------------------------------------
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      err.expose = true;
      return next(err);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        monthlyIncome: true,
        currencyPreference: true,
        timezone: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return res.fail("User not found", 404);

    return res.success({ user }, "Profile fetched");
  } catch (error) {
    req.app
      .get("logger")
      ?.error({ message: error.message, stack: error.stack });
    return next(error);
  }
};

//------------------------------------------------------------
// REFRESH ACCESS TOKEN
//------------------------------------------------------------
export const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken =
      req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

    if (!refreshToken) {
      const err = new Error("Refresh token required");
      err.statusCode = 400;
      err.expose = true;
      return next(err);
    }

    let payload;
    try {
      payload = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
      );
    } catch {
      const err = new Error("Invalid or expired refresh token");
      err.statusCode = 401;
      err.expose = true;
      return next(err);
    }

    const tokenRecord = await findRefreshTokenRecord(refreshToken);
    if (!tokenRecord || tokenRecord.revoked) {
      const err = new Error("Refresh token invalid or revoked");
      err.statusCode = 401;
      err.expose = true;
      return next(err);
    }

    // Rotate refresh token
    await revokeRefreshTokenByHash(refreshToken);

    const userStub = { id: payload.userId || payload.id };
    const newAccessToken = signAccessToken(userStub);
    const newRefreshToken = signRefreshToken(userStub);

    await persistRefreshToken(newRefreshToken, userStub.id);

    res.cookie(
      REFRESH_COOKIE_NAME,
      newRefreshToken,
      REFRESH_COOKIE_OPTIONS
    );

    return res.success({ accessToken: newAccessToken }, "Access token refreshed");
  } catch (error) {
    req.app
      .get("logger")
      ?.error({ message: error.message, stack: error.stack });
    return next(error);
  }
};

//------------------------------------------------------------
// LOGOUT CURRENT DEVICE
//------------------------------------------------------------
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) return res.fail("Refresh token required", 400);

    await revokeRefreshTokenByHash(refreshToken);
    res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);

    return res.success(null, "Logged out successfully");
  } catch (error) {
    req.app
      .get("logger")
      ?.error({ message: error.message, stack: error.stack });
    return next(error);
  }
};

//------------------------------------------------------------
// LOGOUT ALL DEVICES
//------------------------------------------------------------
export const logoutAll = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      err.expose = true;
      return next(err);
    }

    await revokeAllRefreshTokensForUser(userId);
    res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);

    return res.success(null, "Logged out from all devices");
  } catch (error) {
    req.app
      .get("logger")
      ?.error({ message: error.message, stack: error.stack });
    return next(error);
  }
};
