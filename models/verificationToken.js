const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const verificationTokenSchema = new mongoose.Schema({
 owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"users",
    require:true
 },
 token:{
    type:String,
    require:true
 },
createdAt:{
    type:Date,
    expires: 3600,
    default: Date.now()
}

});

verificationTokenSchema.pre('save', async function (next) {
  if (this.isModified('token')) {
   const hash = await bcrypt.hash(this.token, 4);
   this.token = hash;
  }
      
      next();
  
});

verificationTokenSchema.methods.compareToken = async function (token) {
 
    const result = await bcrypt.compareSync(token, this.token);
    return result;
 
};

// verificationTokenSchema.statics.isThisEmailInUse = async function (email) {
//   if (!email) throw new Error('Invalid Email');
//   try {
//     const user = await this.findOne({ email });
//     if (user) return false;

//     return true;
//   } catch (error) {
//     console.log('error inside isThisEmailInUse method', error.message);
//     return false;
//   }
// };

module.exports = mongoose.model('VerificationToken', verificationTokenSchema);
