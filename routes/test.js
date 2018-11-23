const router = require('express').Router();
const integerGenerator = require('../bin/helpers').integerGenerator;

router.get('/json', (req, res, next) => {
  res.json(req.query);
});

router.get('/random', async (req, res, next) => {
  try {
    const value = await integerGenerator(3, 1, 10);
    return res.json(value);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
