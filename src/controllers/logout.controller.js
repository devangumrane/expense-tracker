import { revokeRefreshTokenByHash, revokeAllRefreshTokensForUser } from "../services/auth/token.service.js";

const REFRESH_COOKIE_NAME = "refreshToken";

export const logout = async (req, res) => {
  try {
    // Optionally revoke single token from cookie:
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (refreshToken) {
      await revokeRefreshTokenByHash(refreshToken);
    }

    // Also clear cookie
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/" });

    // If you want "logout everywhere", revoke all tokens for the user (requires access token)
    // Use verifyToken middleware before this handler to get req.user.userId
    if (req.user?.userId) {
      await revokeAllRefreshTokensForUser(req.user.userId);
    }
    return res.json({ success: true, message: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ error: "Failed to logout" });
  }
};
