/* eslint-disable no-console */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const utils = require("./utils");
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;


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

const jwtAlgorithm = 'HS512';

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
 * Passport strategy to verify that a JWT (sent with an API request)
 * is indeed valid. The JWT must be sent in the HTTP header key "Authorization".
 *
 * `jwtPayload` is an object literal containing the decoded JWT payload
 * `done` is a "passport error first callback"
 */
passport.use(new JWTStrategy({
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJWT.fromHeader('authorization'),
  algorithms: [jwtAlgorithm]
}, async (jwtPayload, done) => {
  // console.log("JWT STRATEGY payload:", jwtPayload);
  try {
    // throw new Error("purposefully failed JWT strategy");
    return done(null, jwtPayload.username);
  } catch (error) {
    return done(error);
  }
}));

/**
 * Middleware to be used by an express route handler to validate the provided JWT.
 *
 * We supply a custom callback as the 3rd argument to passport.authenticate
 * as normally no error is raised if the JWT is invalid.
 * This lets us log, or throw (and catch somewhere else)
 */
const jwtMiddleware = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      next(err);
    }
    if (info && info.name === 'JsonWebTokenError') {
      res.statusMessage = "Unauthorized";
      utils.verbose(`Invalid JWT from IP ${req.ip}`);
      return res.status(500).end();
    }
    return next();
  })(req, res, next);
};


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
      const token = jwt.sign(unsignedToken, jwtSecret, {algorithm: jwtAlgorithm});
      // console.log("SENDING TOKEN :)", unsignedToken, token);
      utils.verbose(`Successful login from IP ${req.ip} (JWT sent)`);
      return res.json({ token });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
};

/**
 * Handle a failed login gracefully.
 * NOTE: must provide 4 args in order to handle errors, otherwise Express takes over!
 * NOTE 2: this middleware is _only_ called if there is an error
 * see https://expressjs.com/en/guide/error-handling.html
 */
const handleFailedLogin = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const msg = err.message || "Login unsuccessful";
  res.statusMessage = msg;
  res.status(500).end();
  utils.verbose(`${msg} from IP ${req.ip}`);
};

const setUp = ({app}) => app.use(passport.initialize());

const addHandlers = ({app}) => {
  app.post('/login', loginMiddleware, handleFailedLogin);
};

module.exports = {
  setUp,
  addHandlers,
  jwtMiddleware
};
