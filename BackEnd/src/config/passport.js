const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../models");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "dummy_google_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy_google_client_secret",
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
        user = await db.User.create({
          username: displayName || email.split("@")[0],
          email: email,
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

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
