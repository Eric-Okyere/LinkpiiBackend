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
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});









// const CLIENT_ID = '450195054535-pfsl62amudom8agpnt90b3ilorjd4v0f.apps.googleusercontent.com';
// const client = new OAuth2Client(CLIENT_ID);


// exports.googleSignIn = async (req, res) => {
//   const { token } = req.body;

//   try {
//     // Verify Google token
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     const { email, given_name, family_name, picture } = payload;

//     // Check if the user already exists
//     let user = await User.findOne({ email });

//     if (!user) {
//       // If the user does not exist, create a new user
//       user = new User({
//         id: user._id.toString(),
//         name: given_name || "Unknown",
//         lastname: family_name || "Unknown",
//         email,
//         phone: "", // Default phone number
//         password: "", // No password for Google sign-in
//         avatar: picture, // Save Google profile picture
//         picture, // Also save it in the 'picture' field
//         isGoogleUser: true, // Flag indicating Google sign-in
//       });

//       // Save the new user to the database
//       await user.save();
//     }

//     // Generate JWT token
//     const authToken = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, {
//       expiresIn: '1h',
//     });

//     const userInfo = {
//       id: user._id.toString(),  // Convert _id to id
//       name: user.name,
//       lastname: user.lastname || "",
//       email: user.email,
//       admin: user.admin || false,
//       avatar: user.avatar || "",
//       picture: user.picture || "",
//       phone: user.phone || "",
//       verified: user.verified || false,
//       isGoogleUser: user.isGoogleUser || false,
//       eulaProductAccepted: user.eulaProductAccepted || false,
//       dateCreated: user.dateCreated,
//       report: user.report || false,
//       products: user.products || [],
//       resetPasswordToken: user.resetPasswordToken || null,
//       resetPasswordExpires: user.resetPasswordExpires || null,
//     };

//     // Send back user information and token
//     res.json({ success: true, user: userInfo, token: authToken });
//   } catch (error) {
//     console.error('Error during Google sign-in:', error);
//     res.status(500).json({ success: false, message: 'Google sign-in failed' });
//   }
// };




exports.googleSignIn = async (req, res) => {
  
  const { token } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: [process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_IOS_CLIENT_ID],
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture } = payload;

    // Check if the user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user
      user = new User({
        name: given_name || "Unknown",
        lastname: family_name || "Unknown",
        email,
        phone: "", // Default phone number
        password: "", // No password for Google sign-in
        avatar: picture,
        picture,
        isGoogleUser: true,
      });

      await user.save();
    }

    // Generate JWT token
    const authToken = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    const userInfo = {
      id: user._id.toString(),
      name: user.name,
      lastname: user.lastname || "",
      email: user.email,
      admin: user.admin || false,
      avatar: user.avatar || "",
      picture: user.picture || "",
      phone: user.phone || "",
      verified: user.verified || false,
      isGoogleUser: user.isGoogleUser || false,
      eulaProductAccepted: user.eulaProductAccepted || false,
      dateCreated: user.dateCreated,
      report: user.report || false,
      products: user.products || [],
      resetPasswordToken: user.resetPasswordToken || null,
      resetPasswordExpires: user.resetPasswordExpires || null,
    };

    res.json({ success: true, user: userInfo, token: authToken });
  } catch (error) {
    console.error('Error during Google sign-in:', error);
    res.status(500).json({ success: false, message: 'Google sign-in failed' });
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
  const { name, email, password, phone, lastname } = req.body;

  console.log("Received request:", req.body);

  // Validate email format using regex
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const allowedDomains = ["@gmail.com", "@email.com", "@yahoo.com"];
  const emailDomain = email.toLowerCase().substring(email.indexOf('@'));

  if (!allowedDomains.includes(emailDomain)) {
    return res.status(400).json({ message: "Invalid email domain." });
  }

  console.log("Is Valid Domain:", allowedDomains.includes(emailDomain));

  // Check if the email is already in use
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({ message: "Email already in use. Please login" });
  }

  // Create new user WITHOUT manual password hashing
  const newUser = new User({
    name,
    lastname,
    email: email.toLowerCase(),
    phone,
    password,  // Do NOT hash here, let Mongoose middleware handle it
  });

  // Save the new user
  await newUser.save();

  res.json({
    success: true,
    user: {
      name: newUser.name,
      lastname: newUser.lastname,
      email: newUser.email,
      phone: newUser.phone,
      id: newUser._id,
      verified: newUser.verified,
    },
  });
};







exports.userSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found with the given email!' });
    }

    if (user.isGoogleUser) {
      return res.status(403).json({ success: false, error: 'Please log in using Google.' });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, error: 'Invalid credentials!' });
    }

    console.log(`Comparing password: ${password} with hashed: ${user.password}`);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Email or password does not match!' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ success: true, user: { id: user._id, email: user.email }, token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
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





exports.changePassword = async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {
    // Step 1: Find the user by their ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Step 2: Compare current password with the one stored in the database
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    // Step 3: Hash the new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Step 4: Update the user's password in the database
    user.password = hashedNewPassword;
    await user.save();

    // Step 5: Send a success response
    return res.status(200).json({ success: true, message: "Password changed successfully" });

  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};





exports.adminEditPassword = async (req, res) => {
  const { newPassword } = req.body;
  const { id: userId } = req.params; // Extract userId from URL parameters

  try {
    // Step 1: Find the user by their ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Step 2: Validate new password strength
    if (newPassword.length < 4) { // Example: 8 characters minimum
      return res.status(400).json({ success: false, message: "New password is too weak" });
    }

    // Step 3: Hash the new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Step 4: Update the user's password in the database
    user.password = hashedNewPassword;
    await user.save();

    // Step 5: Send a success response
    return res.status(200).json({ success: true, message: "Password reset successfully" });

  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};




exports.updatePhone = async (req, res) => {
  const { id } = req.params;
  const { phone } = req.body;

  // Check if phone is provided
  if (!phone) {
    return res.status(400).json({ message: "Phone number is required." });
  }

  try {
    // Find the user by ID and update the phone
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { phone },
      { new: true } // Return the updated document
    );

    // If the user is not found
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Return the updated user
    res.json({
      success: true,
      message: "Phone number updated successfully.",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        lastname: updatedUser.lastname,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
    });
  } catch (error) {
    console.error("Error updating phone:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
