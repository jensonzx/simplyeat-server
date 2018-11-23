const {
  DB_USERNAME,
  DB_PASSWORD,
  AUTH_SECRET_KEY,
  CLIENT_SERVER_KEY,
  MAPS_API_KEY
} = process.env;

const config = {
  db: {
    url: `mongodb://${DB_USERNAME}:${DB_PASSWORD}@ds161653.mlab.com:61653/simply-eat`
  },
  message: {
    connected: 'Mongoose connected to mongodb',
    error: err => `Mongoose connection error: ${err}`,
    paramRequired: params =>
      `The following required parameters are missing: ${params}`
  },
  auth: {
    secretKey: AUTH_SECRET_KEY,
    clientServerKey: CLIENT_SERVER_KEY
  },
  api: {
    googleMaps: {
      key: MAPS_API_KEY
    }
  }
};

module.exports = config;
