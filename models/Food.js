// A collection of food data
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

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  shortId: {
    type: String,
    required: true,
    unique: true
  },
  types: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodType'
      }
    ],
    required: true
  },
  attributes: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodAttribute'
      }
    ],
    required: true
  }
});

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;
