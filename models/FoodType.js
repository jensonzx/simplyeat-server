// A collection of types associated to the foods (cuisines)
const mongoose = require('mongoose');

// const config = require('../config/config');
// const db = config.db.url;
// const msg = config.message;

// mongoose
//   .connect(
//     db,
//     { useNewUrlParser: true }
//   )
//   .then(() => {
//     console.log(msg.connected);
//   })
//   .catch(err => {
//     console.log(msg.error(err));
//   });

const typeSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String
  },
  shortId: {
    type: String,
    required: true,
    unique: true
  }
});

const FoodType = mongoose.model('FoodType', typeSchema);

module.exports = FoodType;
