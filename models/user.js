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
  },
  report:{
    type: Boolean,
    default:false,
   
   },
   eulaProductAccepted: {
    type: Boolean,
    default: false,
    
  },
  resetPasswordToken: {
    type: String,
    required: false,
  },
  resetPasswordExpires: {
    type: Date,
    required: false,
  }
});

// Pre-save hook for hashing the password
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    // Ensure password is hashed only if it's a plain text password
    const isHashed = await bcrypt.getRounds(this.password) > 0;
    if (!isHashed) {
      try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
      } catch (err) {
        return next(err);
      }
    } else {
      next();
    }
  } else {
    next();
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
