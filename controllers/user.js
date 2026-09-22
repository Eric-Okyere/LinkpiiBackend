const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { sendError, createRandomBytes } = require('../utils/helpers');
const { isValidObjectId } = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require("cloudinary").v2
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const { Resend } = require('resend');
const resetToken = require('../models/resetToken');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const {decrypt} = require('../utils/encryption');



cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



// exports.googleSignIn = async (req, res) => {
  
//   const { token } = req.body;

//   try {
//     if (!token) {
//       return res.status(400).json({ success: false, message: "Token is required" });
//     }

//     // Verify Google token
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: [process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_IOS_CLIENT_ID, process.env.ANDROID_CLIENT_ID, process.env.GOOGLE_CLIENT_ID_RELEASE]
//     });

//     const payload = ticket.getPayload();
//     const { email, given_name, family_name, picture } = payload;

//     // Check if the user already exists
//     let user = await User.findOne({ email });

//     if (!user) {
//       // Create a new user
//       user = new User({
//         name: given_name || "Unknown",
//         lastname: family_name || "Unknown",
//         email,
//         phone: "", // Default phone number
//         password: "", // No password for Google sign-in
//         avatar: picture,
//         picture,
//         isGoogleUser: true,
//       });

//       await user.save();
//     }

//     // Generate JWT token
//     const authToken = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, {
//       expiresIn: '1h',
//     });

//     const userInfo = {
//       id: user._id.toString(),
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

    // Log the token (temporarily for debugging purposes)
    console.log("📦 Received token:", token.slice(0, 40) + "...");

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: [
        process.env.ANDROID,
        process.env.ANDROID1,
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_IOS_CLIENT_ID,
        process.env.ANDROIDCLIENTID,
        process.env.GOOGLE_CLIENT_ID_RELEASE,
      ]
    });

    const payload = ticket.getPayload();

    // Log what audience the token is actually for
    console.log("✅ Token verified. Audience:", payload.aud);
    console.log("📧 Email:", payload.email);

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
        verified: true, // Google has already confirmed this email address
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
    console.error("❌ Google sign-in error:", error.message);
    console.error(error); // Full error output
    res.status(500).json({ success: false, message: "Google sign-in failed" });
  }
};






exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ dateCreated: -1 }).lean();

    const decryptedUsers = users.map((user) => {
      try {
        if (user.avatar) user.avatar = decrypt(user.avatar);
        if (user.picture) user.picture = decrypt(user.picture);
        if (user.ghback) user.ghback = decrypt(user.ghback);
      } catch (err) {
        console.warn(`Decryption skipped for user ${user._id}:`, err.message);
      }
      return user;
    });

    res.json(decryptedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

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

  // Generate an email-verification token and send the verification email via
  // Resend (same HTTP API used for password resets). Sending failures are
  // logged but never block signup - the account is already created.
  try {
    const verificationTokenValue = crypto.randomBytes(32).toString('hex');
    newUser.verificationToken = verificationTokenValue;
    newUser.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await newUser.save();

    const verifyUrl = `${process.env.FRONTEND_URL || 'https://linkpii.com'}/verify-email/${verificationTokenValue}`;
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error: verifyEmailError } = await resend.emails.send({
      from: 'Linkpii <no-reply@linkpii.com>',
      to: newUser.email,
      subject: 'Verify your Linkpii email address',
      text: `Welcome to Linkpii! Please verify your email by clicking this link: ${verifyUrl}`,
      html: `<p>Welcome to Linkpii! Please verify your email address by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`,
    });

    if (verifyEmailError) {
      console.error('Resend error sending verification email:', verifyEmailError);
    }
  } catch (emailError) {
    console.error('Error sending verification email:', emailError);
  }

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

    if (!user.verified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email before logging in. Check your inbox for the verification link we sent when you signed up.',
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, user: { id: user._id, email: user.email }, token });

    user.signin = true;
    await user.save();
    
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};



exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Invalid verification link' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'This verification link is invalid or has expired' });
    }

    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Your email has been verified',
      user: { name: user.name, email: user.email, id: user._id },
    });
  } catch (error) {
    console.error('Error in verifyEmail:', error);
    return res.status(500).json({ success: false, message: 'Error verifying email' });
  }
};



exports.getUserById = async (req, res) => {
  const userId = req.params.id;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  try {
    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Attempt decryption only if field is non-null
    const tryDecrypt = (value) => {
      if (!value) return null;
      try {
        return decrypt(value);
      } catch (err) {
        console.warn(`Decryption failed for value: ${value}. Returning as-is.`);
        return value; // Fallback if not encrypted
      }
    };

    user.avatar = tryDecrypt(user.avatar);
    user.picture = tryDecrypt(user.picture);
    user.ghback = tryDecrypt(user.ghback);

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};











// Old get User by Id
// exports.getUserById = async (req, res) => {
//   const userId = req.params.id;

//   if (!isValidObjectId(userId)) {
//     return res.status(400).json({ success: false, message: 'Invalid user ID' });
//   }

//   try {
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     res.json(user);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };



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
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    // Find the user by email (emails are stored lowercase)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User with that email does not exist' });
    }

    if (user.isGoogleUser) {
      return res.status(400).json({ success: false, message: 'This account signs in with Google. Password reset is not available.' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour

    // Save the token and its expiration in the database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiration;
    await user.save();

    // Create the reset URL (front-end URL + token)
    const resetUrl = `${process.env.FRONTEND_URL || 'https://linkpii.com'}/reset-password/${resetToken}`;

    // Send the email via Resend's HTTP API (plain HTTPS, so it works on
    // Render's free tier, which blocks outbound SMTP ports). Requires
    // RESEND_API_KEY in .env and a verified sending domain in Resend.
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error: resendError } = await resend.emails.send({
      from: 'Linkpii <no-reply@linkpii.com>',
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Please click the link to reset your password: ${resetUrl}`,
      html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
    });

    if (resendError) {
      console.error('Resend error in forgotPassword:', resendError);
      return res.status(500).json({ success: false, message: 'Error sending reset email' });
    }

    return res.status(200).json({ success: true, message: 'Reset link sent to your email' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    return res.status(500).json({ success: false, message: 'Error sending reset email' });
  }
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

exports.LastSeen = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: { lastSeen: new Date() },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, lastSeen: user.lastSeen, platfUsed: user.platfUsed });
  } catch (error) {
    console.error('Error updating lastSeen and platfUsed:', error);
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
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ success: false, message: 'New password is too weak' });
    }

    // Find user by the reset token and ensure the token is not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Set the new password (the pre-save hook on the User model hashes it)
    user.password = newPassword;
    user.resetPasswordToken = undefined; // Clear the reset token
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({ success: true, message: 'Password has been reset' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
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

    // Step 3: Validate the new password
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ success: false, message: "New password is too weak" });
    }

    // Step 4: Update the user's password (the pre-save hook on the User model hashes it)
    user.password = newPassword;
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
    if (!newPassword || newPassword.length < 4) { // Example: 8 characters minimum
      return res.status(400).json({ success: false, message: "New password is too weak" });
    }

    // Step 3: Update the user's password (the pre-save hook on the User model hashes it)
    user.password = newPassword;
    await user.save();

    // Step 4: Send a success response
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



exports.pushNotification =  async (req, res) => {
  const { id } = req.params;
  const { pushToken } = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, { pushToken }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Push token saved', pushToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error saving push token' });
  }
};


exports.incrementPlatfUsed = async (req, res) => {
  const userId = req.params.id;

  
    try {
      // Find the product by ID
      const product = await User.findById(userId);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // Increment the view count
      product.platfUsed++;
  
      // Save the updated product document
      await product.save();
  
      // Return the product details with the updated view count
      return res.json(product);
    
  } catch (error) {
    console.error('Error incrementing platfUsed:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};