/**
 * Validate the parameters to check whether the parameters are empty or not.
 * @param requiredParams The array that contains instances of RequiredParams object class
 * @returns Returns the names of parameters with null value in string format, otherwise return false
 * if all parameters have values.
 */
module.exports.validateRequiredParams = requiredParams => {
  if (!(requiredParams instanceof Array))
    throw new TypeError('requiredParams must be an instance of Array');

  // Filters the required parameters by the one that has value of null
  const emptyParamNames = requiredParams
    .filter(param => !param.value)
    .map(param => param.key)
    .join();

  return !emptyParamNames ? false : emptyParamNames;
};

module.exports.RequiredParams = class {
  constructor(key, value) {
    (this.key = key), (this.value = value);
  }
};
