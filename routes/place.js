const router = require('express').Router();
const axios = require('axios');

// Helpers
const helperMethods = require('../bin/helpers');
const authenticateToken = helperMethods.authenticateToken;
const { RequiredParams, validateRequiredParams } = require('../bin/params');

// Data models
const Place = require('../models/Place');
const User = require('../models/User');
const Food = require('../models/Food');

const config = require('../config/config');
const paramRequiredMsg = config.message.paramRequired;
const apiKey = config.api.googleMaps.key;
const defaultRadius = 5000;

const resolveApiErrorStatus = jsonData => {
  if (jsonData.status == 'ZERO_RESULTS')
    throw new Error('Invalid location, server returned no results');
  if (jsonData.status != 'OK') throw new Error(axiosResult.data.error_message);
};

const getRegion = async regionName => {
  const regionDoc = await Place.findOne({ name: regionName });
  if (regionDoc) return regionDoc;

  const geocodingUrl =
    'https://maps.googleapis.com/maps/api/place/findplacefromtext/json';
  const axiosResult = await axios.get(geocodingUrl, {
    params: {
      key: apiKey,
      input: regionName,
      fields: 'name,geometry,formatted_address',
      inputtype: 'textquery'
    }
  });
  if (axiosResult.status != 200)
    throw new Error('Google Maps API is currently down at the moment');
  resolveApiErrorStatus(axiosResult.data);

  const result = axiosResult.data.candidates[0];
  const coordinates = result.geometry.location;
  console.log(result);

  const region = await Place.create({
    placeId: result.place_id || '',
    name: result.name,
    address: result.formatted_address,
    coordinates: {
      latitude: coordinates.lat,
      longitude: coordinates.lng
    }
  });
  return region;
};

// GET: /getplaces?food={food}&location={location}
router.get('/getplaces', async (req, res, next) => {
  try {
    const { food, location } = req.query;

    // Validate required params
    const emptyParams = validateRequiredParams([
      { key: 'foodName', value: food },
      { key: 'location', value: location }
    ]);
    if (emptyParams) throw new Error(paramRequiredMsg(emptyParams));

    const region = await getRegion(location);
    const coordinates = region.coordinates;

    const placeTextSearchUrl =
      'https://maps.googleapis.com/maps/api/place/textsearch/json';
    const axiosResult = await axios.get(placeTextSearchUrl, {
      params: {
        query: food,
        key: apiKey,
        location: `${coordinates.latitude},${coordinates.longitude}`,
        radius: defaultRadius
      }
    });

    if (axiosResult.status != 200)
      throw new Error('Google Maps API is currently down at the moment');
    resolveApiErrorStatus(axiosResult.data);

    const places = axiosResult.data.results;
    return res.json({
      message: `Successfully retrieved ${places.length} locations`,
      food: food,
      places: places
    });
  } catch (err) {
    return next(err);
  }
});

// POST: /saveplace?foodId={foodId}&placeId={placeId}&location={location}&address={address}&lat={lat}&lng={lng}&[notes]={notes}
router.post('/saveplace', authenticateToken(), async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { foodId, placeId, location, address, lat, lng, notes } = req.body;
    const emptyParams = validateRequiredParams([
      new RequiredParams('foodId', foodId),
      new RequiredParams('placeId', placeId),
      new RequiredParams('location', location),
      new RequiredParams('address', address),
      new RequiredParams('lat', lat),
      new RequiredParams('lng', lng)
    ]);
    if (emptyParams) throw new Error(paramRequiredMsg(emptyParams));

    // Find food object from the database
    const foodDoc = await Food.findOne({ shortId: foodId }).select('name');
    // Find place from the database, if not exist, create one and add it to the database
    const placeDoc =
      (await Place.findOne({ placeId })) ||
      (await Place.create({
        placeId: placeId,
        locationName: location,
        address: address,
        coordinates: { lat, lng }
      }));
    // Find the current user and update the saved locations field to the database
    const userDoc = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          savedLocations: {
            timeAdded: new Date(),
            place: placeDoc._id,
            food: foodDoc._id,
            notes: notes
          }
        }
      },
      { new: true }
    ).select('-passwordHash');

    return res.json({
      message: "Saved location data to user's savedLocation field in database",
      food: foodDoc,
      place: placeDoc,
      user: userDoc
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
