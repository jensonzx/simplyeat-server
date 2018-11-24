const passport = require('passport');
const axios = require('axios');

const helperMethods = {};

/**
 * Calls the unique integer generator through the random.org API using axios
 * ranging from the given smallest value to largest (inclusive) value
 * @param count The number of integers requested
 * @param min The smallest value allowed for each integer
 * @param max The largest value allowed for each integer
 * @returns An array of randomly generated, non-repeating integers
 */
helperMethods.integerGenerator = async (count, min, max) => {
  if (
    typeof min != 'number' ||
    typeof max != 'number' ||
    typeof count != 'number'
  )
    throw new TypeError('All parameters must be a number type');

  const url = 'https://www.random.org/integer-sets/';
  const axiosResult = await axios.get(url, {
    params: {
      sets: 1,
      num: count,
      min: min,
      max: max,
      order: 'index',
      format: 'plain',
      rnd: 'new'
    }
  });
  if (axiosResult.status == 503)
    throw new Error(
      axiosResult.data || 'Random.org service is currently down at the moment'
    );

  // The number is returned in number-type array
  const numbers =
    typeof axiosResult.data == 'number'
      ? [axiosResult.data]
      : axiosResult.data
          .trim()
          .split(' ')
          .map(Number);
  return numbers;
};

// The traditional, unreliable way to generate a set of unique integers
helperMethods.mathRandom = (count, min, max) => {
  if (
    typeof min != 'number' ||
    typeof max != 'number' ||
    typeof count != 'number'
  )
    throw new TypeError('All parameters must be a number type');
  if (max - min < count || min > max)
    throw new Error('Invalid number range, check your input numbers');

  max = Math.floor(max);
  min = Math.floor(min);

  const numbers = [];
  for (let i = 0; i < count; ) {
    let num = Math.floor(Math.random() * (max - min)) + min;
    if (!numbers.includes(num)) {
      numbers.push(num);
      i++;
    }
  }
  return numbers;
};

/**
 * Returns a randomly generated integer from min to max (inclusive) value
 * @param min The minimum value in the number range
 * @param max The maximum value in the number range
 * @returns An integer randomly selected from the given number range
 */
helperMethods.randInt = async (min = 0, max = 1) => {
  min = Math.floor(min);
  max = Math.floor(max);

  const numbers = await helperMethods.integerGenerator(1, min, max);
  return numbers[0];
  // Math.random() is unreliable for not having true randomness
  // return Math.floor(Math.random() * (max - min)) + min;
};

helperMethods.getFoodId = foodName => {
  if (typeof foodName != 'string')
    throw new TypeError('foodName must not be an array');

  return foodName
    .toLowerCase()
    .split(' ')
    .join('_');
};

/**
 * Generate ID of random digits with length defined by user
 * @param length The number of digits for the generated ID
 * @param callback The callback function that check whether the ID matches an existing ID
 * @returns The random generated ID
 */
helperMethods.randShortId = (length, callback) => {
  const id = 0;
  do {
    id = helperMethods.randInt(0, Math.pow(10, length));
  } while (callback(id));

  // TODO: Replace with random generator from random.org API
};

helperMethods.authenticateToken = () =>
  passport.authenticate('jwt', { session: false });

helperMethods.validateClientServerToken = token => {
  // TODO: Use JWT to sign the token to check if its valid or not
};

helperMethods.isUserAdmin = (req, res, next) => {
  if (req.user.username != 'admin')
    return res.status(403).json({
      error: 'Authorization error',
      message: 'User does not have privileges to access this page'
    });
  return next();
};

module.exports = helperMethods;
