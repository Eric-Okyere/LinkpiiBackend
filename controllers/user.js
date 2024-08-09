const jwt = require('jsonwebtoken');
const User = require('../models/user');
const verificationToken = require('../models/verificationToken');
const { sendError, createRandomBytes } = require('../utils/helpers');
const { generateOTP, mailTransprot } = require('../utils/mail');
const { isValidObjectId } = require('mongoose');
const { OAuth2Client } = require('google-auth-library');

const resetToken = require('../models/resetToken');






const CLIENT_ID = '450195054535-j1v4j3vcg8rtl0oek01n1g7nkto7c7vc.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

exports.googleSignin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const userId = payload['sub'];

    // Here, you can create or update the user in your database
    res.json({ success: true, userId, email: payload.email });
  } catch (error) {
    console.error('Error verifying ID token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};






exports.getUsers = async (req,res)=>{
  const productList = await User.find().sort({ dateCreated: -1 })
  if(!productList){
      res.status(500).json({success: false})
  }
  res.send(productList)
}

exports.userCount= async (req, res) => {
  try { 
    const userCount = await User.countDocuments();
    res.json(userCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    
      User.findByIdAndRemove(req.params.id).then(user=>{
          if(user){
              return res.status(200).json({success:true, message:"the users is deleted successfully"})
          } else{
              return res.status(404).json({success: false, message: "users not found"})
          }
      }).catch(err=>{
          return res.status(400).json({success: false, error: err})
      })
 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.createUser = async (req, res) => {
  const { name, email, password,phone } = req.body;
  const user = await User.findOne({email});
  if (user)
    return sendError(res, "This email is already in use, try sign-in")

  const newUser = await User({
    name,
    email,
    phone,
    password,
  });


const OTP = generateOTP()
 const verif = new verificationToken({
  owner: newUser._id,
  token: OTP
})


  await verif.save();
  await newUser.save();

mailTransprot().sendMail({
  from:"emailverification@gmail.com",
  to: newUser.email,
  subject:"verify your email account",
  html: `<h1> Please verify your email with this code ${OTP}</h1>`
})

  res.json({ success: true, user:{
    name: newUser.name, email: newUser.email, phoneno:newUser.phone, id: newUser._id, verified: newUser.verified
  } });
};




exports.userSignIn = async (req, res) => {
  const { email, password } = req.body;


  const user = await User.findOne({ email });

  if (!user)
    return res.json({
      success: false,
      error: 'user not found, with the given email!',
    });

  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return res.json({
      success: false,
      error: 'email / password does not match!',
    });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });


  const userInfo = {
    name: user.name,
    email: user.email,
    admin: user.admin,
    id: user._id,
    avatar: user.avatar 
    ? user.avatar : '',
    // products:user.products._id
  };
  req.user=user
console.log(req.user.id);

  res.json({ success: true, user: userInfo, token });
};


exports.verifyEmail = async (req, res)=>{
const {userId, otp} = req.body
// if(!userId) return sendError(res, "Invalid request, missing parameters!")

if(!isValidObjectId(userId)) return sendError(res, "Invalid user id!")

const user = await User.findById(userId)
if(!user) return sendError(res, "Sorry, user not found!")

if(user.verified) return sendError(res, "This account is already verified!")


const token = await verificationToken.findOne({owner: user._id})
if(!token) return sendError(res, "Sorry user not found!")

const isMatched = await token.compareToken(otp)
if(!isMatched) return sendError(res, "Please provide a valid token!")

user.verified = true;

await verificationToken.findByIdAndDelete(token._id)
await user.save()


mailTransprot().sendMail({
  from:"emailverification@gmail.com",
  to: user.email,
  subject:"verify your email account",
  html: `<h1> Email verify successfully </h1>`
})

res.json({ 
  success: true, 
  message:"Your email is verified",
  user:{ name: user.name, email: user.email, id: user._id }

});

}



exports.getUserById = async (req, res) => {
  const userId = req.params.id;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.forgotPassword = async(req, res)=>{

const {email}= req.body;
if(!email) return sendError(res, "Sorry, provid a valid email!")

const user = await User.find({email});
if(!user) return sendError(res, "User not found")


const token = await resetToken.findOne({owner: user._id})
if(token) return sendError(res, "You can only request for another token in one hour!")


const randomBytes = await createRandomBytes()
const ResetToken = new resetToken({owner: user._id, token: randomBytes})
await ResetToken.save();


mailTransprot().sendMail({
  from:"security@gmail.com",
  to: user.email,
  subject:"Password reset",
  html: `http://localhost:3000/reset-password?token=${randomBytes}&id=${user._id}`
})

res.json({success: true, error: "Password reset link is sent to your email"})


}

exports.Report = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await User.findByIdAndUpdate(productId, { report: true }, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.Rectified = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await User.findByIdAndUpdate(productId, { report: false }, { new: false });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
exports.EULA = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await User.findByIdAndUpdate(productId, { eulaAccepted: true }, { new: false });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.EULAPost = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await User.findByIdAndUpdate(productId, { eulaProductAccepted: true }, { new: false });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// exports.EULA = async (req, res) => {
//   const productId  = req.body;
//   try {
//     await User.findByIdAndUpdate(productId, { eulaAccepted: true });
//     res.send('EULA accepted');
//   } catch (err) {
//     res.status(400).send('Error accepting EULA');
//   }
// };