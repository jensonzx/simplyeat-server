const router = require('express').Router();
const passport = require('passport');

// Helpers function
const { RequiredParams, validateRequiredParams } = require('../bin/params');
const helpers = require('../bin/helpers');
const authenticateToken = helpers.authenticateToken;
const getFoodId = helpers.getFoodId;
const randInt = helpers.randInt;
const isUserAdmin = helpers.isUserAdmin;
const integerGenerator = helpers.integerGenerator;

const paramRequiredMsg = require('../config/config').message.paramRequired;

// Data models
const User = require('../models/User');
const Food = require('../models/Food');
const FoodType = require('../models/FoodType');
const FoodAttribute = require('../models/FoodAttribute');

const convertNameListToIdList = async (ids, Model) => {
  if (!ids)
    throw new Error('Types and attributes are required for this action');
  if (!(ids instanceof Array))
    throw new TypeError("The property 'names' must be an array type");
  if (ids.length < 1) throw new Error('The array must have at least one item');

  ids = ids.map(id => id.toLowerCase());
  return await Model.find({ shortId: { $in: ids } }).select('_id');
};

const jsonToArray = jsonStr => {
  try {
    if (!jsonStr) return null;
    else if (jsonStr instanceof Array) return jsonStr;

    return JSON.parse(jsonStr);
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getFoods = async req => {
  const qTypes = jsonToArray(req.query.types);
  const qAttrs = jsonToArray(req.query.attributes);

  const foodsDoc = await Food.find().populate('types attributes');
  const filterFoods = foodsDoc.filter(food => {
    // checks whether the types/attributes of food contains any of the
    // types/attributes specified in query
    return (
      (!qTypes || food.types.some(type => qTypes.includes(type.shortId))) &&
      (!qAttrs || food.types.some(attr => qAttrs.includes(attr.shortId)))
    );
  });

  return filterFoods;
};

// GET: /getfood?name={name} OR /getfood?id={shortId}
router.get('/getfood', async (req, res, next) => {
  try {
    const _id = req.query.id || '';
    const _name = req.query.name || '';

    // If param id exist, get food based on the shortId
    // If not, look for name param, then get food based on the name

    const searchQuery = _id
      ? { shortId: getFoodId(_id) }
      : _name
      ? { name: _name }
      : null;

    if (!searchQuery)
      throw new Error('id or name param must be specified in the url');
    const food = await Food.findOne(searchQuery).populate('types attributes');

    return res.json(food);
  } catch (error) {
    return next(error);
  }
});

// GET: /getfoods?types={types}&attributes={attributes}
router.get('/getfoods', async (req, res, next) => {
  try {
    const foods = await getFoods(req);

    return res.json(foods);
  } catch (err) {
    return next(err);
  }
});

// GET: /getrandomfood?list={[randomedFoods]}
// [randomedFoods]: JSON string of the array of food list (in shortID form)
// Call this URL if user is not logged in
router.get('/getrandomfood', async (req, res, next) => {
  try {
    // expecting a list of Food's shortIds
    const randomedFoods = jsonToArray(req.query.list);
    const randomFood =
      randomedFoods[await randInt(0, randomedFoods.length - 1)];

    const foodDoc = await Food.findOne({ shortId: randomFood }).populate(
      'types attributes'
    );

    return res.json({
      message: 'Successfully retrieved a randomly selected food from the list',
      food: foodDoc
    });
  } catch (error) {
    return next(error);
  }
});

// GET: /getrandomfoods?types={types}&attributes={attributes}&limit={limit}
router.get('/getrandomfoods', async (req, res, next) => {
  try {
    const maxLength = 8;
    const foods = await getFoods(req);
    // Get the limit to the random items it can generate ranging from 1 to length of foods array
    const limitQuery = parseInt(req.query.limit) || 1;
    const limit = !limitQuery
      ? 1
      : Math.min(limitQuery, foods.length, maxLength) || 1;

    // Bad algorithm
    // for (let i = 0; i < limit; ) {
    //   const food = foods[await randInt(0, foods.length)];
    //   if (!randomFoods.includes(food)) {
    //     randomFoods.push(food);
    //     i++;
    //   }
    // }
    const foodIndexes = await integerGenerator(limit, 0, foods.length - 1);
    const randomFoods = foodIndexes.map(foodIndex => foods[foodIndex]);

    return res.json(randomFoods);
  } catch (error) {
    return next(error);
  }
});

// Replaced with /getfoods
// router.get('/getallfood', async (req, res, next) => {
//   try {
//     const idOnly = req.query.showonlyid;
//     const foodDocs = await Food.find().populate('types attributes');
//     const foods = !idOnly ? foodDocs : foodDocs.map(food => food.shortId);

//     return res.json(foods);
//   } catch (err) {
//     return next(err);
//   }
// });

router.get('/getfoodtypes', async (req, res, next) => {
  try {
    const types = await FoodType.find();

    return res.json(types);
  } catch (err) {
    return next(err);
  }
});

router.get('/getfoodattributes', async (req, res, next) => {
  try {
    const attributes = await FoodAttribute.find();

    return res.json(attributes);
  } catch (err) {
    return next(err);
  }
});

router.post(
  '/addfood',
  authenticateToken(),
  isUserAdmin,
  async (req, res, next) => {
    try {
      const name = req.body.name;
      const desc = req.body.desc;

      // JSON parse the arrays
      const types = await convertNameListToIdList(
        jsonToArray(req.body.types),
        FoodType
      );
      const attributes = await convertNameListToIdList(
        jsonToArray(req.body.attributes),
        FoodAttribute
      );

      const food = await Food.create({
        name: name,
        description: desc,
        types: types,
        attributes: attributes,
        shortId: getFoodId(name)
      });

      return res.json({
        message: 'Successfully added food',
        document: food
      });
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  '/addfoodtype',
  authenticateToken(),
  isUserAdmin,
  async (req, res, next) => {
    try {
      const name = req.body.name;
      const desc = req.body.desc;

      const foodType = await FoodType.create({
        name: name,
        description: desc,
        shortId: getFoodId(name)
      });

      return res.json({
        message: 'Successfully added food type',
        document: foodType
      });
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  '/addfoodattribute',
  authenticateToken(),
  isUserAdmin,
  async (req, res, next) => {
    try {
      const name = req.body.name;
      const desc = req.body.desc;

      const foodAttribute = await FoodAttribute.create({
        name: name,
        description: desc,
        shortId: getFoodId(name)
      });

      return res.json({
        message: 'Successfully added food attribute',
        document: foodAttribute
      });
    } catch (err) {
      return next(err);
    }
  }
);

// POST: /addfoodhistory?list={[randomedFoods]}
// food: shortId of the food
// If user is authenticated (has token), call this instead of /getrandomfood
router.post('/addfoodhistory', authenticateToken(), async (req, res, next) => {
  try {
    // expecting a list of Food's shortIds
    const randomedFoods = jsonToArray(req.body.list);
    const randomFood =
      randomedFoods[await randInt(0, randomedFoods.length - 1)];
    const userId = req.user._id;

    const foodDoc = await Food.findOne({ shortId: randomFood }).populate(
      'types attributes'
    );

    // Finds the user document by ID
    // Then add the food object in the foodHistory of the user object
    const userDoc = await User.findByIdAndUpdate(
      userId,
      {
        $push: { foodHistory: { timestamp: new Date(), food: foodDoc._id } }
      },
      { new: true }
    )
      .select('-passwordHash')
      .populate({ path: 'foodHistory.food', select: 'name' });

    return res.json({
      message: 'Random food retrieved and added to food history database',
      selectedFood: foodDoc,
      user: userDoc
    });
  } catch (error) {
    return next(error);
  }
});

// POST: /savefood?foodid={foodid}&[notes]={notes}
router.post('/savefood', authenticateToken(), async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { foodid, notes } = req.body;
    const emptyParams = validateRequiredParams([
      new RequiredParams('foodid', foodid)
    ]);
    if (emptyParams) throw new Error(paramRequiredMsg(emptyParams));

    const foodDoc = await Food.findOne({ shortId: foodid }).select('_id');
    if (!foodDoc)
      throw new Error(`No food object returned with the id: ${foodid}`);

    const userDoc = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          savedFoods: {
            timeAdded: new Date(),
            food: foodDoc._id,
            notes: notes
          }
        }
      },
      { new: true }
    ).select('-passwordHash');

    return res.json({
      message: "Saved food data to user's savedFood field in database",
      food: foodDoc,
      user: userDoc
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
