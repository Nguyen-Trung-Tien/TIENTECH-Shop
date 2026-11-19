const crypto = require("crypto");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../models");
require("dotenv").config();

const generateUniqueGoogleUsername = async (displayName, email) => {
  const rawBase = (displayName || email.split("@")[0] || "user").trim();
  const base = rawBase.slice(0, 40) || "user";

  const existingBase = await db.User.findOne({ where: { username: base } });
  if (!existingBase) return base;

  for (let i = 0; i < 5; i++) {
    const suffix = crypto.randomBytes(3).toString("hex");
    const candidate = `${base.slice(0, 36)}_${suffix}`;
    const exists = await db.User.findOne({ where: { username: candidate } });
    if (!exists) return candidate;
  }
  return `user_${crypto.randomBytes(6).toString("hex")}`;
};

const isProduction = process.env.NODE_ENV === "production";
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (isProduction && (!googleClientId || !googleClientSecret)) {
  console.error("[SECURITY] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in production; Google OAuth disabled.");
}

if (!isProduction || (googleClientId && googleClientSecret)) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId || "dummy_google_client_id",
        clientSecret: googleClientSecret || "dummy_google_client_secret",
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/v1/user/auth/google/callback",
        proxy: true,
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, emails, displayName, photos } = profile;
        const primaryEmail = emails?.[0];
        const email = primaryEmail?.value;
        const isEmailVerified = primaryEmail?.verified !== false;
        const avatar = photos?.[0]?.value || null;

        if (!email || !isEmailVerified) {
          return done(new Error("Google account email is missing or unverified"), null);
        }

        let user = await db.User.findOne({ where: { email } });

        if (user) {
          // Update googleId if not already set (never unban admin-suspended accounts)
          if (!user.googleId) {
            user.googleId = id;
            if (!user.password) {
              user.provider = "google";
            }
            if (user.isActive || user.verificationToken !== null) {
              user.isActive = true;
              user.verificationToken = null;
            }
            await user.save();
          }
          return done(null, user);
        }

        // Create new user if not exists
        const uniqueUsername = await generateUniqueGoogleUsername(displayName, email);
        user = await db.User.create({
          username: uniqueUsername,
          email: email,
          password: null,
          googleId: id,
          provider: "google",
          avatar: avatar,
          isActive: true,
          role: "customer",
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
}

module.exports = passport;
