const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  admin: {
    type: Boolean,
    default: false,
    required: true
  },
  name: {
    type: String,
    default: ""
  },
  lastname: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    // Add email validation to accept dots
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
    required: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook for hashing the password
userSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    bcrypt.hash(this.password, 4, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  if (!password) throw new Error('Password is missing, cannot compare!');

  try {
    const result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    console.log('Error while comparing password:', error.message);
  }
};

module.exports = mongoose.model('users', userSchema);
