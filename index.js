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
// const SpareParts = require("./routes/SpareParts");
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
const Mechaniccomment = require("./routes/Coments/MechanicComment")
const Okadacomment = require("./routes/Coments/OkadaComment")
const Sparecomment = require("./routes/Coments/Sparepartscomments")
const Buildingcomment = require("./routes/Coments/BuildingComment")
const rentCarcomment = require("./routes/Coments/CarRentComment")
const Equipmentcomment = require("./routes/Coments/EquipmentCommet")
const commentRoute = require("./routes/Coments/commentRoute")
const Uploadpdfs = require("./routes/UploadFiles")
const Mechanicscats = require("./routes/Mechaniccates")
const Newmech = require("./routes/newmechcats")
const Newmechmain = require("./routes/Newmech")
const userIdcard = require("./routes/UserIdcard")
const Sparepartscats = require("./routes/SparepartsnewCats")
const Sparepartsmainpost = require("./routes/SparepartmainPost")
const fashionViewers = require("./routes/Coments/FashionViewers")
const Shopviwersec = require("./routes/Coments/Shopcommentsec")
const Productviwers = require("./routes/Coments/ProductViewers")
const DeleteAccount = require("./routes/DeleteAccount")
const Boost = require("./routes/Boost/Boost")
const rating = require("./routes/Rating/rating")
const reqt = require("./routes/Coments/request")
const Version = require("./controllers/Version")
const appVersionRoutes = require("./routes/Appversion")


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
// general categories
app.use("/fashion", Fashion);
// general main post
app.use("/fashionpost", Fashionpost);
app.use("/mechanics", MechanicsRoutes);
app.use("/time", Time);
app.use("/call", Call);
app.use("/whatsapp", Whatsapp);
app.use("/services", Services);
app.use("/okada", Okada);
// app.use("/spare", SpareParts);
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
app.use("/mechanicscomment", Mechaniccomment);
app.use("/sparecomment", Sparecomment);
app.use("/buidingcomment", Buildingcomment);
app.use("/rentcarcomment", rentCarcomment);
app.use("/equipmentcomment", Equipmentcomment);
app.use('/toxic', commentRoute);
app.use("/uploadfile", Uploadpdfs)
app.use("/mechcates", Mechanicscats)
app.use("/newmech", Newmech )
app.use("/newmechmain", Newmechmain )
app.use("/files", express.static("files"))
app.use("/card", userIdcard)
app.use("/sparecatnew", Sparepartscats)
app.use("/sparepartsmainpost", Sparepartsmainpost)
app.use("/viewers", fashionViewers)
app.use("/shopviewers", Shopviwersec)
app.use("/productviewers", Productviwers)
app.use("/", DeleteAccount)
app.use("/boost", Boost)
app.use("/rating", rating)
app.use("/", reqt)
app.use("/version", Version)
app.use('/appversion', appVersionRoutes);


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
