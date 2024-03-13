const express = require('express');
const app = express();
require("dotenv/config")
const  bodyParser = require("body-parser");
const morgan = require("morgan")
const mongoose = require("mongoose")
const cors = require("cors")
require("./models/products/products")
const cookieParser = require("cookie-parser")
const userRouter = require('./routes/user');
const categoriesRoutes= require("./routes/categories")
const productRouter = require("./routes/Products")
const advertRouter = require("./routes/Advert");
const driverRoutes = require("./routes/CarsRoutes")
const airtel = require("./routes/Airtel")
const MTN = require("./routes/MTN")
const Vodafone = require("./routes/Vodafone")
const Emergency = require("./routes/Emergency")
const CodeUsers = require("./routes/Codeusers")
const Fashion = require("./routes/categoriesFashion")
const Fashionpost = require("./routes/Fashion")
const MechanicsRoutes = require("./routes/MechanicsRoutes")
const Call = require("./routes/call")
const Time = require("./routes/Time")
const fs = require('fs');



const targetDirectory = '/farmbackend';

// middleware
app.use(express.json());
app.use(bodyParser.json({limit:"30mb", extended:true}));
app.use(bodyParser.urlencoded({limit:"30mb", extended:true}));
const api = process.env.API_URL
app.use(morgan("tiny"))
app.use(cors())
app.options("*", cors())
app.use('/public/uploads', express.static(__dirname+'/public/uploads'))
app.use(cookieParser());






app.use('/categories', categoriesRoutes)
app.use(`/send`,  productRouter)
app.use("/",userRouter);
app.use("/cars", driverRoutes);
app.use("/", advertRouter);
app.use("/airtel", airtel);
app.use("/mtn", MTN);
app.use("/vodafone", Vodafone);
app.use("/emergency", Emergency);
app.use("/codeusers", CodeUsers);
// fashion categories
app.use("/fashion", Fashion); 
app.use("/fashionpost", Fashionpost);
app.use("/mechanics", MechanicsRoutes);
app.use("/time", Time);
app.use("/call", Call);


try {
   fs.mkdirSync(targetDirectory);
 } catch (err) {
   if (err.code !== 'EEXIST') {
     console.error('Error creating directory:', err);
   }
 }


const PORT = process.env.PORT || 3000



 mongoose.connect(process.env.CONNECTION_STRING,{
    useNewUrlParser: true,
    useUnifiedTopology:true,

    dbName:"farm",
 })
 .then(()=>{
    console.log("Mongo is ready")
 })
 .catch((err)=>{
    console.log(err)
 })
app.listen(PORT, () => {
    console.log(api)
  console.log(`server is working on port ${PORT}  http://localhost:3000`);
});