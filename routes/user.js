const router = require('express').Router();
const passport = require('passport');
const authenticateToken = require('../bin/helpers').authenticateToken;
const User = require('../models/User');

router.get('/getuser', authenticateToken(), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'savedFoods.food savedLocations.food savedLocations.place foodHistory.food'
    );

    return res.json({ message: 'Authorized', user: user });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
