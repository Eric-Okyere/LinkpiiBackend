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
    required: true,
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
  products:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "employee",
}],
 avatar:{
  type: String,
  default:""
 },
 verified:{
  type: Boolean,
  default:false,
  require: true
 },
 report:{
  type: Boolean,
  default:false,
 
 },
 dateCreated:{
  type:Date, 
  default: Date.now 
},
eulaAccepted: {
  type: Boolean,
  default: false,
  
},
eulaProductAccepted: {
  type: Boolean,
  default: false,
  
}

});

userSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    bcrypt.hash(this.password, 4, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  }
});

userSchema.methods.comparePassword = async function (password) {
  if (!password) throw new Error('Password is missing, can not compare!');

  try {
    const result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    console.log('Error while comparing password!', error.message);
  }
};


module.exports = mongoose.model('users', userSchema);
