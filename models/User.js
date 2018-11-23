const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  savedFoods: [
    {
      timeAdded: {
        type: Date
      },
      notes: String,
      food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food'
      }
    }
  ],
  savedLocations: [
    {
      // TODO: Detect whether the location is saved before or not
      // TODO: Put those objects in a separate Region schema (except timeAdded)
      timeAdded: Date,
      notes: String,
      food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food'
      },
      place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place'
      }
    }
  ],
  foodHistory: [
    {
      timestamp: Date,
      food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food'
      }
    }
  ]
});

// This function will be called, we'll get the plain text password, hash it and store it.
userSchema.pre('save', async function(next) {
  // 'this' refers to the current document about to be saved
  const user = this;
  // Hash the password with a salt round of 10, the higher the rounds the more secure, but the slower
  // your application becomes.
  const hash = await bcrypt.hash(this.passwordHash, 10);
  // Replace the plain text password with the hash and then store it
  // Indicates we're done and moves on to the next middleware
  user.passwordHash = hash;
  next();
});

userSchema.methods.isValidPassword = async function(password) {
  const user = this;

  const compare = await bcrypt.compare(password, user.passwordHash);
  return compare;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
