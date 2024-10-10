const jwt = require('jsonwebtoken');
const User = require('../models/user');
const verificationToken = require('../models/verificationToken');
const { sendError, createRandomBytes } = require('../utils/helpers');
const { generateOTP, mailTransprot } = require('../utils/mail');
const { isValidObjectId } = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require("cloudinary").v2
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const resetToken = require('../models/resetToken');


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});









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
  const { name, email, password,  phone, lastname } = req.body;

  console.log("Received request:", req.body);

  // Validate email format using regex
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Check if the email domain is either @gmail.com, @email.com, or @yahoo.com
  const allowedDomains = ["@gmail.com", "@email.com", "@yahoo.com"];
  const emailDomain = email.toLowerCase().substring(email.indexOf('@'));
  
  // If email does not belong to allowed domains, return an error
  if (!allowedDomains.includes(emailDomain)) {
    return res.status(400).json({ message: "Invalid email domain." });
  }

  console.log("Is Valid Domain:", allowedDomains.includes(emailDomain));


  // Check if the email is already in use
  const user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    return res.status(400).json({ message: "Email already in use. Please login" });
  }

  // Hash the password before saving
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create a new user object
  const newUser = new User({
    name,
    lastname,
    email: email.toLowerCase(),
    phone,
    password: hashedPassword,  // Save hashed password
  });

  // Save the new user to the database
  await newUser.save();

  // Return success response
  res.json({
    success: true,
    user: {
      name: newUser.name,
      lastname: newUser.lastname,
      email: newUser.email,
      phoneno: newUser.phone,
      id: newUser._id,
      verified: newUser.verified,
    },
  });
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



// exports.forgotPassword = async(req, res)=>{

// const {email}= req.body;
// if(!email) return sendError(res, "Sorry, provid a valid email!")

// const user = await User.find({email});
// if(!user) return sendError(res, "User not found")


// const token = await resetToken.findOne({owner: user._id})
// if(token) return sendError(res, "You can only request for another token in one hour!")


// const randomBytes = await createRandomBytes()
// const ResetToken = new resetToken({owner: user._id, token: randomBytes})
// await ResetToken.save();


// mailTransprot().sendMail({
//   from:"security@gmail.com",
//   to: user.email,
//   subject:"Password reset",
//   html: `http://localhost:3000/reset-password?token=${randomBytes}&id=${user._id}`
// })

// res.json({success: true, error: "Password reset link is sent to your email"})


// }



// Function to handle password reset request
exports.forgotPassword= async (req, res) => {
  const { email } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).send('User with that email does not exist');
  }

  // Generate a reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour

  // Save the token and its expiration in the database
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetTokenExpiration;
  await user.save();

  // Create the reset URL (front-end URL + token)
  const resetUrl = `https://linkpiireset.netlify.app/reset-password/${resetToken}`;

  // Send the email
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST, 
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

  const mailOptions = {
    to: user.email,
    from: 'linkpiiapp@gmail.com',
    subject: 'Password Reset Request',
    text: `You requested a password reset. Please click the link to reset your password: ${resetUrl}`
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      return res.status(500).send('Error sending email');
    }
    res.status(200).send('Reset link sent to your email');
  });
};




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


exports.updateUserPicture = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if a valid user ID is provided
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    // Check if a file is provided
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No picture file provided' });
    }

    // Upload the image to Cloudinary and get the secure URL
    const picture = req.file.path;
    const cloudinaryResult = await cloudinary.uploader.upload(picture);
    const pictureUrl = cloudinaryResult.secure_url;

    // Update the user's picture in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { picture: pictureUrl },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User picture updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user picture:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


// Reset password endpoint
exports.resetPassword= async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  // Find user by the reset token and ensure the token is not expired
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).send('Invalid or expired token');
  }

  // Set the new password
  user.password = newPassword;
  user.resetPasswordToken = undefined;  // Clear the reset token
  user.resetPasswordExpires = undefined;
  
  await user.save();

  res.status(200).send('Password has been reset');
};



// Password reset route
// exports.resetPassword = async (req, res) => {
//   const { email, newPassword } = req.body;

//   // Check if the user exists with the provided email
//   const user = await User.findOne({ email: email.toLowerCase() });
//   if (!user) {
//     return res.status(400).json({ error: "User not found" });
//   }



//   // Hash the new password
//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(newPassword, salt);

//   // Update the user's password
//   user.password = hashedPassword;
//   await user.save();

//   // Return success response
//   res.json({ success: true, message: "Password has been reset successfully" });
// };



// Function to handle password reset request
// app.post('/forgot-password', 
  
// exports.forgotPassword= async (req, res) => {
//   const { email } = req.body;

//   // Find the user by email
//   const user = await User.findOne({ email });
//   if (!user) {
//     return res.status(404).send('User with that email does not exist');
//   }

//   // Generate a reset token
//   const resetToken = crypto.randomBytes(32).toString('hex');
//   const resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour

//   // Save the token and its expiration in the database
//   user.resetPasswordToken = resetToken;
//   user.resetPasswordExpires = resetTokenExpiration;
//   await user.save();

//   // Create the reset URL (front-end URL + token)
//   const resetUrl = `localhost:5173//reset-password/${resetToken}`;

//   // Send the email
//   const transporter = nodemailer.createTransport({
//     service: 'Gmail', // or any email provider
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   const mailOptions = {
//     to: user.email,
//     from: 'ericokyere021@gmail.com',
//     subject: 'Password Reset Request',
//     text: `You requested a password reset. Please click the link to reset your password: ${resetUrl}`
//   };

//   transporter.sendMail(mailOptions, (err) => {
//     if (err) {
//       return res.status(500).send('Error sending email');
//     }
//     res.status(200).send('Reset link sent to your email');
//   });
// };
