const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../models");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/v1/user/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, emails, displayName, photos } = profile;
        const email = emails[0].value;
        const avatar = photos[0].value;

        let user = await db.User.findOne({ where: { email } });

        if (user) {
          // Update googleId and provider if not already set
          if (!user.googleId) {
            user.googleId = id;
            user.provider = "google";
            user.isActive = true; // Social login users are automatically active
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
