const express = require("express");
const router = express.Router();
const { postAutoComment } = require("../utils/autoComments");
const { Comment } = require("../models/comment/comment");
const { Foodcomment } = require("../models/Food/FoodComment");

const { Product: AgricProduct } = require("../models/products/products");
const { Car } = require("../models/Car/CarModel");
const { Product: FashionProduct } = require("../models/products/Fashion");
const { Mechanics } = require("../models/Mechanics/Mechanicsmodel");
const { Services } = require("../models/products/services");
const { Okada } = require("../models/Okada/Okada");
const { Buildings } = require("../models/Building/building");
const { Product: RentcarProduct } = require("../models/Car/RentCars");
const { Equipmentmain } = require("../models/products/Equipments");
const { Product: NewmechProduct } = require("../models/products/Newmech");
const { Product: SparepartsProduct } = require("../models/products/Sparepartsmainpost");
const { Food } = require("../models/Food/Food");
const { Shops } = require("../models/shops/shops");

// TEMPORARY, secret-protected one-time backfill endpoint - not linked from
// anywhere in the app. Remove this file and its require/app.use lines in
// index.js once the backfill has been run.
//
// GET /admin/backfill-auto-comments?key=SECRET
//   -> dry run: reports how many approved, comment-less listings exist per
//      category, without writing anything.
// GET /admin/backfill-auto-comments?key=SECRET&run=1
//   -> actually posts one generic auto-comment to every approved listing
//      that currently has zero comments, across all 13 categories.
const ADMIN_SECRET = "064736b2451657c5dd55642d0cc1cbd2584bdf88836a01c1";

// label, Model, CommentModel (only Food differs)
const CATEGORIES = [
  ["product", AgricProduct, Comment],
  ["cars", Car, Comment],
  ["fashionpost", FashionProduct, Comment],
  ["mechanics", Mechanics, Comment],
  ["services", Services, Comment],
  ["okada", Okada, Comment],
  ["buildings", Buildings, Comment],
  ["rentcar", RentcarProduct, Comment],
  ["equipmentmain", Equipmentmain, Comment],
  ["newmechmain", NewmechProduct, Comment],
  ["sparepartsmainpost", SparepartsProduct, Comment],
  ["food", Food, Foodcomment],
  ["shops", Shops, Comment],
];

router.get("/backfill-auto-comments", async (req, res) => {
  if (req.query.key !== ADMIN_SECRET) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const shouldRun = req.query.run === "1";
  const results = [];

  for (const [label, Model, CommentModel] of CATEGORIES) {
    try {
      const query = {
        approved: true,
        $or: [{ comments: { $exists: false } }, { comments: { $size: 0 } }],
      };
      const targets = await Model.find(query, { _id: 1 });

      if (shouldRun) {
        for (const doc of targets) {
          await postAutoComment(Model, doc._id, CommentModel);
        }
      }

      results.push({ category: label, eligible: targets.length, commented: shouldRun ? targets.length : 0 });
    } catch (error) {
      results.push({ category: label, error: error.message });
    }
  }

  res.json({
    success: true,
    mode: shouldRun ? "run" : "dry-run (add &run=1 to actually post comments)",
    results,
    totalEligible: results.reduce((sum, r) => sum + (r.eligible || 0), 0),
  });
});

module.exports = router;
