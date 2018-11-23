const express = require('express');
const app = express();
require('./auth/auth');

const config = require('./config/config');
const db = config.db.url;
const msg = config.message;

const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');

// Routes modules
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const foodRoutes = require('./routes/food');
const testRoutes = require('./routes/test');
const placeRoutes = require('./routes/place');

mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log(msg.connected);
  })
  .catch(err => {
    console.log(msg.error(err));
  });

app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', authRoutes);

app.use('/', userRoutes);

app.use('/food', foodRoutes);

app.use('/place', placeRoutes);

app.use('/test', testRoutes);

// Handle errors
app.use((err, req, res, info) => {
  const errJsonString = JSON.stringify(err, Object.getOwnPropertyNames(err));
  console.log('Error caught: ', errJsonString);
  res.status(err.status || 500).json(JSON.parse(errJsonString));
});

app.listen(3000, () =>
  console.log('Listening on port 3000...key is ', config.test)
);
