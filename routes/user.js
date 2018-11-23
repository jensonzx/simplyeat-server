const router = require('express').Router();
const passport = require('passport');
const authenticateToken = require('../bin/helpers').authenticateToken;

router.get('/getuser', authenticateToken(), (req, res, next) => {
  try {
    return res.json({ message: 'Authorized', user: req.user });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
