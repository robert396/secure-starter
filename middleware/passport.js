const passport = require('passport');
const GithubStrategy = require('passport-github2').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;

const githubStrategy = new GithubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
    return done(null, { profile, accessToken, refreshToken });
});

const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: (req) => req.session.jwt,
    secretOrKey: process.env.JWT_SECRET_KEY
  },
  (payload, done) => {
    return done(null, payload);
  }
);

passport.use(githubStrategy);
passport.use(jwtStrategy);

module.exports = passport;