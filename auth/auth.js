const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User');
const secretKey = require('../config/config').auth.secretKey;

// JWT modules
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

//We use this to extract the JWT sent by the user
const ExtractJWT = require('passport-jwt').ExtractJwt;

passport.use(
  'register',
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    },
    async (username, password, done) => {
      try {
        const user = await User.create({
          username: username,
          passwordHash: password
        });
        // Pass the user object to next middleware
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  'login',
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    },
    async (username, password, done) => {
      try {
        // Find the user associated with the username
        const user = await User.findOne({ username });

        //Validate password and make sure it matches with the corresponding hash stored in the database
        //If the passwords match, it returns a value of true.
        const validate = await user.isValidPassword(password);
        // This method is more secure as it does not reveal whether the user exists in database or not
        if (!(user && validate)) {
          return done(null, false, { message: 'Invalid user credentials' });
        }

        //Send the user information to the next middleware
        return done(null, user, { message: 'Logged in successfully' });
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Verify the authentication token to allow access to secured pages
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secretKey
    },
    async (token, callback) => {
      try {
        const user = await User.findById(token.user._id).select(
          '-passwordHash'
        );

        // Pass the user to next middleware
        return callback(null, user);
      } catch (err) {
        return callback(err);
      }
    }
  )
);
