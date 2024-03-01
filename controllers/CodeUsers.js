const jwt = require('jsonwebtoken');
const CodeUsers = require('../models/CodesFolder/CodeUsers');
const bcrypt = require('bcrypt');


exports.getUsers = async (req,res)=>{
  // let filter = {};
  // if(req.query.category){
  //     filter = {category: req.query.category.split(',')}
  // }
  const productList = await CodeUsers.find().sort({ dateCreated: -1 })
  if(!productList){
      res.status(500).json({success: false})
  }
  res.send(productList)
}


exports.userCodeCount= async (req, res) => {
    try {
      const productCount = await CodeUsers.countDocuments();
      res.json(productCount);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };


exports.deleteUser= async(req, res)=>{
  CodeUsers.findByIdAndRemove(req.params._id).then(user=>{
      if(user){
          return res.status(200).json({success:true, message:"the users is deleted successfully"})
      } else{
          return res.status(404).json({success: false, message: "users not found"})
      }
  }).catch(err=>{
      return res.status(400).json({success: false, error: err})
  })
}


exports.createUser = async (req, res) => {
  const { name, phone, password } = req.body;
  const user = await CodeUsers.findOne({phone});
  if (user)
    return res.status(404).json({success: false, message: "This number is already in use, try sign-in"})


  const newUser = await CodeUsers({
    name,
    phone,
    password,
  });

  await newUser.save();

  res.json({ success: true, user:{
    name: newUser.name, phone: newUser.phone, id: newUser._id,
  } });
};


exports.userSignIn = async (req, res) => {
  const { phone, password } = req.body;

  try {
    // Find the user by phone number
    const user = await CodeUsers.findOne({ phone });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Compare the provided password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    // If the password matches, generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send the token and user information in the response
    res.status(200).json({
      success: true,
      token: token,
      user: {
        name: user.name,
        phone: user.phone,
        id: user._id
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};






