const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const sk = require('../config/config').auth.secretKey;

router.post(
  '/register',
  passport.authenticate('register', { session: false }),
  async (req, res, next) => {
    return res.json({
      message: 'Signed up successfully',
      user: req.user
    });
  }
);

router.post('/login', (req, res, next) => {
  passport.authenticate('login', { session: false }, (err, user, info) => {
    try {
      if (err || !user) {
        const message = (info && info.message) || err || 'An error has occured';
        const error = new Error(message);
        return next(error);
      }

      req.logIn(user, { session: false }, async err => {
        if (err) res.json(err);

        const body = { _id: user._id, username: user.username };

        const token = await jwt.sign({ user: body }, sk);
        return res.json({ token, user: body });
      });
    } catch (err) {
      return next(err);
    }
  })(req, res, next);
});

module.exports = router;
