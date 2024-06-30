const express = require('express');
const app = express();
require("dotenv/config");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require('fs');
const path = require('path');

require("./models/products/products");

const userRouter = require('./routes/user');
const categoriesRoutes = require("./routes/categories");
const productRouter = require("./routes/Products");
const advertRouter = require("./routes/Advert");
const driverRoutes = require("./routes/CarsRoutes");
const airtel = require("./routes/Airtel");
const MTN = require("./routes/MTN");
const Vodafone = require("./routes/Vodafone");
const Emergency = require("./routes/Emergency");
const CodeUsers = require("./routes/Codeusers");
const Fashion = require("./routes/categoriesFashion");
const Buildingcat = require("./routes/BuildingCats");
const Building = require("./routes/Building");
const Fashionpost = require("./routes/Fashion");
const Services = require("./routes/Services");
const Okada = require("./routes/Okada");
const SpareParts = require("./routes/SpareParts");
const MechanicsRoutes = require("./routes/MechanicsRoutes");
const Call = require("./routes/call");
const Whatsapp = require("./routes/Whatsapp");
const Time = require("./routes/Time");
const Servicescategories = require("./routes/ServicesCategories");
const Shopscat = require("./routes/ShopsCategories");
const Shop = require("./routes/Shops");
const Rentcarscats = require("./routes/RentcarsCate");
const RentCar = require("./routes/Rentcar");
const Equipmentscats = require("./routes/EquipmentsCats");
const Equipmentmain = require("./routes/EquipmentsMain");
const FashionComment = require("./routes/Coments/Fashioncomment");
const Servicescomment = require("./routes/Coments/Servicescomment");
const Complaints = require("./routes/Compliants/Complaints")
const ShopComments = require("./routes/Coments/ShopComments")
const Agriccomment = require("./routes/Coments/Agriccomment")
const Drivercomment = require("./routes/Coments/DriverComment")
const Okadacomment = require("./routes/Coments/OkadaComment")

// Replace this line
// const bcrypt = require('bcrypt');

// With this line
const bcrypt = require('bcryptjs');

// Define the writable directory path
const writableDirectoryPath = path.join(__dirname, 'farmbackend');

// Ensure the directory exists
if (!fs.existsSync(writableDirectoryPath)) {
  try {
    fs.mkdirSync(writableDirectoryPath, { recursive: true });
    console.log(`Writable directory created at: ${writableDirectoryPath}`);
  } catch (error) {
    console.error(`Error creating directory: ${error.message}`);
    process.exit(1); // Exit the process with failure
  }
}

// Middleware
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
const api = process.env.API_URL;
app.use(morgan("tiny"));
app.use(cors());
app.options("*", cors());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(cookieParser());

app.use('/categories', categoriesRoutes);
app.use(`/send`, productRouter);
app.use("/", userRouter);
app.use("/cars", driverRoutes);
app.use("/", advertRouter);
app.use("/airtel", airtel);
app.use("/mtn", MTN);
app.use("/vodafone", Vodafone);
app.use("/emergency", Emergency);
app.use("/codeusers", CodeUsers);
app.use("/fashion", Fashion);
app.use("/fashionpost", Fashionpost);
app.use("/mechanics", MechanicsRoutes);
app.use("/time", Time);
app.use("/call", Call);
app.use("/whatsapp", Whatsapp);
app.use("/services", Services);
app.use("/okada", Okada);
app.use("/spare", SpareParts);
app.use("/servcat", Servicescategories);
app.use("/shopscat", Shopscat);
app.use("/shops", Shop);
app.use("/buildingcats", Buildingcat);
app.use("/buildings", Building);
app.use("/rentcarcats", Rentcarscats);
app.use("/rentcar", RentCar);
app.use("/equipmentcat", Equipmentscats);
app.use("/equipmentmain", Equipmentmain);
app.use("/comment", FashionComment);
app.use("/compliants", Complaints);
app.use("/servicescomment", Servicescomment);
app.use("/shopcomment", ShopComments);
app.use("/agriccomment", Agriccomment);
app.use("/drivercomment", Drivercomment);
app.use("/okadacomment", Okadacomment);

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "farm",
})
  .then(() => {
    console.log("Mongo is ready");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(PORT, () => {
  console.log(api);
  console.log(`Server is working on port ${PORT}  http://localhost:3000`);
});
