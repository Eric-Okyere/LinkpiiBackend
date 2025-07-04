const mongoose = require("mongoose");

const FoodCatsSchema = new mongoose.Schema({
  name: {
    type: String,
    default:"" 
  },
  picture: {
    type: String,
    default: "", 
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("FoodCats", FoodCatsSchema);
