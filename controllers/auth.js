const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: "450195054535-pfsl62amudom8agpnt90b3ilorjd4v0f.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:5173/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // You can handle user data here, such as saving to the database
      console.log("User profile:", profile);
      return done(null, profile);
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user
passport.deserializeUser((user, done) => {
  done(null, user);
});
