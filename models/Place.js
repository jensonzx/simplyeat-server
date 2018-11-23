// A collection of location/region name along with its coordinates
const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  placeId: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  address: String,
  coordinates: {
    lat: Number,
    lng: Number
  }
});

const Place = mongoose.model('Place', placeSchema);

module.exports = Place;
