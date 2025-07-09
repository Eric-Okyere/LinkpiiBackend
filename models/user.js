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
  resetPasswordToken: {
    type: String,
    required: false,
  },
  resetPasswordExpires: {
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
