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
    default:""
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.isGoogleUser; 
    }
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
  // Set at signup (web) when the user checks "I agree to the Terms
  // and Conditions"; also set on first Google sign-in once the
  // frontend has shown that checkbox. Soft field only - never blocks
  // signup server-side, since this endpoint is shared with the mobile
  // app, which doesn't send it yet.
  termsAccepted: {
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
  },
  verificationCode: {
    type: String,
    required: false,
  },
  verificationCodeExpires: {
    type: Date,
    required: false,
  },
  loginVerificationCode: {
    type: String,
    required: false,
  },
  loginVerificationCodeExpires: {
    type: Date,
    required: false,
  },
  avatar:{
    type:String,
    default:""
  },
  picture: {
    type: String,
    default: ""
  },
  ghback: {
    type: String,
    default: ""
  },
  isGoogleUser: {
    type: Boolean,
    default: false,
  },
  pushToken: {
    type: String,
    default: null
  },
  signin: {
    type: Boolean,
    default: false
  },
  platfUsed: {
    type: Number,
    default: 1
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  // Captured once at first-time signup via the browser/device
  // Geolocation API, so staff can see roughly where a user is
  // without asking them. Never required - some users decline the
  // location permission prompt, and the mobile app may not send it.
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
});


userSchema.pre('save', async function (next) {
  if (this.isModified('password') && !this.password.startsWith('$2b$')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});


// Method to compare passwords securely
userSchema.methods.comparePassword = async function (password) {
  if (!password) throw new Error('Password is required for comparison.');

  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
};




module.exports = mongoose.model('users', userSchema);
