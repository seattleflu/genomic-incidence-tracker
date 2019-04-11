/* eslint-disable no-console */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const utils = require("./utils");

/**
 * Temporary function to mock a db of available users by using a harcoded ENV variables
 * This allows us to test / prototype the app with only a single user
 */
const allowedUsers = (() => {
  const users = [
    {
      username: process.env.GENOMIC_INCIDENCE_TRACKER_USERNAME,
      password: process.env.GENOMIC_INCIDENCE_TRACKER_PASSWORD
    }
  ];
  if (!users[0].username || !users[0].password) {
    utils.error("Couldn't set username / password from ENV variables -- make sure they are set");
  }
  return users;
})();
const jwtSecret = (() => {
  const secret = process.env.GENOMIC_INCIDENCE_TRACKER_JWT_SECRET;
  if (!secret) {
    utils.error("Couldn't set JWT secret from ENV variables -- make sure GENOMIC_INCIDENCE_TRACKER_JWT_SECRET is set");
  }
  return secret;
})();

/**
 * Passport middleware to handle user login
 * The local strategy requires a `verify` function which receives the credentials
 * (`username` and `password`) submitted by the user.
 * The function must verify that the password is correct and then
 * invoke `db` with a user object, which will be set at `req.user` in route
 * handlers after authentication.
 *
 * The fn passed to the strategy is called by passport.authenticate middleware
 */
passport.use(new LocalStrategy(
  (username, password, done) => {
    // console.log("Passport middleware LocalStrategy username", username, "password:", password);

    /* TO DO. The _hash of the_ password should be stored, not the password itself.
    This isn't that important if we're using a single user from env variables ;)
    We have the bcrypt library installed for this. E.g:
    await bcrypt.hash(this.password, 12);
    await bcrypt.compare(plaintextPassword, hashedPassword)
    */

    const user = allowedUsers.filter((u) => {
      return u.username === username && u.password === password;
    })[0];
    if (!user) {
      const message = "Invalid username / password";
      return done(null, null, {message});
    }
    return done(null, user, { message: 'Logged in Successfully'});
  }
));

/**
 * The middleware which is called to authenticate a POST request to /login
 * If successful, it returns a signed (but not encrypted) JWT.
 * On error, it passes it along to the next handler.
 */
const loginMiddleware = (req, res, next) => {
  // console.log("loginMiddleware running. BODY:", req.body);
  passport.authenticate('local', (err, user, info) => {
    /* (err, user, info) is the return value from our instance of LocalStrategy (above) */
    // console.log("passport.authenticate running");
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new Error(info.message));
    }

    try {
      const unsignedToken = {username: user.username};
      const token = jwt.sign(unsignedToken, jwtSecret); // Sign the JWT token
      console.log("SENDING TOKEN :)", unsignedToken, token);
      utils.verbose(`Successful login from IP ${req.ip}`);
      return res.json({ token });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
};

/**
 * Handle a failed login gracefully.
 * NOTE: must provide 4 args in order to handle errors, otherwise Express takes over!
 * see https://expressjs.com/en/guide/error-handling.html
 */
const handleFailedLogin = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const msg = err.message || "Login unsuccessful";
  res.statusMessage = msg;
  res.status(500).end();
  utils.verbose(`${msg} from IP ${req.ip}`);
};

const addHandlers = (app) => {
  app.post('/login', loginMiddleware, handleFailedLogin);
};

module.exports = {
  addHandlers
};
