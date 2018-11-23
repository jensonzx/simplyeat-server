// A collection of attributes associated to the foods
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

const attributeSchema = new mongoose.Schema({
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

const FoodAttribute = mongoose.model('FoodAttribute', attributeSchema);

module.exports = FoodAttribute;
