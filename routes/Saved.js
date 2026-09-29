// Aggregates a buyer's saved ("liked") listings across all 13 categories
// into one response, for a "My Saved Items" screen in the dashboard.

const express = require('express');
const router = express.Router();

const { Product: ProductsModel } = require('../models/products/products');
const { Car } = require('../models/Car/CarModel');
const { Okada } = require('../models/Okada/Okada');
const { Mechanics } = require('../models/Mechanics/Mechanicsmodel');
const { Product: RentcarModel } = require('../models/Car/RentCars');
const { Product: NewmechModel } = require('../models/products/Newmech');
const { Product: FashionModel } = require('../models/products/Fashion');
const { Services } = require('../models/products/services');
const { Shops } = require('../models/shops/shops');
const { Buildings } = require('../models/Building/building');
const { Equipmentmain } = require('../models/products/Equipments');
const { Product: SparepartModel } = require('../models/products/Sparepartsmainpost');
const { Food } = require('../models/Food/Food');

const CATEGORIES = [
  { name: 'Products', model: ProductsModel },
  { name: 'Cars', model: Car },
  { name: 'Okada', model: Okada },
  { name: 'Mechanics', model: Mechanics },
  { name: 'Rentcar', model: RentcarModel },
  { name: 'Newmech', model: NewmechModel },
  { name: 'Fashion', model: FashionModel },
  { name: 'Services', model: Services },
  { name: 'Shops', model: Shops },
  { name: 'Building', model: Buildings },
  { name: 'Equipments', model: Equipmentmain },
  { name: 'Spareparts', model: SparepartModel },
  { name: 'Food', model: Food },
];

// GET /saved/:userId - every listing this user has saved, grouped by
// category. We don't timestamp individual saves, so within a category
// items come back in their natural (insertion) order rather than
// most-recently-saved-first.
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const results = await Promise.all(
      CATEGORIES.map(async ({ name, model }) => {
        const items = await model.find({ likedBy: userId });
        return { category: name, items };
      })
    );

    const totalCount = results.reduce((sum, r) => sum + r.items.length, 0);

    res.status(200).json({ success: true, totalCount, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
