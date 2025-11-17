// src/services/auth/oauth.service.js
import prisma from "../../models/index.js";
import { signAccessToken, signRefreshToken, persistRefreshToken } from "./token.service.js";

export async function upsertOAuthUser(provider, profile) {
  let email = null;

  if (provider === "google") {
    email = profile.emails?.[0]?.value;
  }

  if (provider === "github") {
    // GitHub profile email extraction
    email =
      profile.emails?.[0]?.value ||
      profile._json?.email ||
      profile.username + "@github.user";
  }

  if (!email) {
    throw new Error(`OAuth provider (${provider}) did not return an email`);
  }

  email = email.toLowerCase();

  // Check existing user
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Create new user from OAuth
    user = await prisma.user.create({
      data: {
        email,
        fullName: profile.displayName || null,
        passwordHash: "", // Not used (local login not available)
      },
    });
  }

  const userDto = { id: user.id, email: user.email };

  // Issue tokens
  const accessToken = signAccessToken(userDto);
  const refreshToken = signRefreshToken(userDto);

  // Persist refresh token
  await persistRefreshToken(refreshToken, user.id);

  return { user: userDto, accessToken, refreshToken };
}
