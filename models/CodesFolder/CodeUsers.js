const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const codeSchema = new mongoose.Schema({
 
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

 dateCreated:{
  type:Date, 
  default: Date.now 
},


});

codeSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    bcrypt.hash(this.password, 4, (err, hash) => {
      if (err) return next(err);

      this.password = hash;
      next();
    });
  }
});

codeSchema.methods.comparePassword = async function (password) {
  if (!password) throw new Error('Password is missing, can not compare!');

  try {
    const result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    console.log('Error while comparing password!', error.message);
  }
};


module.exports = mongoose.model('codeusers', codeSchema);
