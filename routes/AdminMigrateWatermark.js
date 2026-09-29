// One-time admin endpoint to backfill the watermark onto already-existing
// listings (created before the delivery-time watermark fix shipped).
//
// Protected by a secret query param so it can be triggered by visiting a
// URL once from a browser. Safe to call more than once - withWatermark()
// is idempotent, so documents that already carry the watermark segment in
// their URL are left untouched.
//
// This is meant to be removed again once it has been run.

const express = require('express');
const router = express.Router();
const { withWatermark } = require('../utils/watermarkOverlay');

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

const TARGETS = [
  { name: 'Products', model: ProductsModel, fields: ['picture', 'picturesec', 'video'] },
  { name: 'Cars', model: Car, fields: ['carpic', 'driverpic'] },
  { name: 'Okada', model: Okada, fields: ['carpic', 'driverpic'] },
  { name: 'Mechanics', model: Mechanics, fields: ['picture', 'propicture'] },
  { name: 'Rentcar', model: RentcarModel, fields: ['picture', 'picturesec'] },
  { name: 'Newmech', model: NewmechModel, fields: ['picture', 'picturesec'] },
  { name: 'Fashion', model: FashionModel, fields: ['picture', 'picturesec', 'video'] },
  { name: 'Services', model: Services, fields: ['picture', 'picturesec', 'video'] },
  { name: 'Shops', model: Shops, fields: ['picture', 'picturesec', 'video'] },
  { name: 'Building', model: Buildings, fields: ['picture', 'picturesec', 'video'] },
  { name: 'Equipments', model: Equipmentmain, fields: ['picture', 'picturesec'] },
  { name: 'Spareparts', model: SparepartModel, fields: ['picture', 'picturesec', 'video'] },
  { name: 'Food', model: Food, fields: ['picture', 'picturesec', 'video'] },
];

const MIGRATE_SECRET = '3ef4780fc074c57f9f35b0ae44dc3e4be261ee655b1b303c';

router.get('/run-once-watermark-backfill', async (req, res) => {
  if (req.query.key !== MIGRATE_SECRET) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const dryRun = req.query.dryRun === '1';

  try {
    const results = [];
    let grandTotalMatched = 0;
    let grandTotalModified = 0;

    for (const { name, model, fields } of TARGETS) {
      const docs = await model.find({}).select(['_id', ...fields]).lean();
      const ops = [];
      let sample = null;

      for (const doc of docs) {
        const set = {};
        for (const field of fields) {
          const original = doc[field];
          const updated = withWatermark(original);
          if (updated && updated !== original) {
            set[field] = updated;
            if (!sample) sample = { field, before: original, after: updated };
          }
        }
        if (Object.keys(set).length > 0) {
          ops.push({ updateOne: { filter: { _id: doc._id }, update: { $set: set } } });
        }
      }

      let modifiedCount = 0;
      if (!dryRun) {
        for (let i = 0; i < ops.length; i += 500) {
          const batch = ops.slice(i, i + 500);
          if (batch.length === 0) continue;
          const result = await model.bulkWrite(batch, { ordered: false });
          modifiedCount += result.modifiedCount || 0;
        }
      }

      results.push({
        name,
        scanned: docs.length,
        matched: ops.length,
        modified: dryRun ? null : modifiedCount,
        sample,
      });
      grandTotalMatched += ops.length;
      grandTotalModified += modifiedCount;
    }

    res.json({
      success: true,
      dryRun,
      results,
      grandTotalMatched,
      grandTotalModified: dryRun ? null : grandTotalModified,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
