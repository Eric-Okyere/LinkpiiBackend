require("dotenv/config");
const mongoose = require("mongoose");
const User = require("./models/user");

(async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING, {
      dbName: "farm",
      serverSelectionTimeoutMS: 8000,
    });
    console.log("Connected.");

    const totalUsers = await User.countDocuments({});
    const unverifiedBefore = await User.countDocuments({ verified: { $ne: true } });
    console.log(`Total users: ${totalUsers}`);
    console.log(`Currently unverified: ${unverifiedBefore}`);

    const result = await User.updateMany(
      { verified: { $ne: true } },
      { $set: { verified: true } }
    );
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

    const unverifiedAfter = await User.countDocuments({ verified: { $ne: true } });
    console.log(`Unverified after migration: ${unverifiedAfter}`);
  } catch (err) {
    console.error("Migration error:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
})();
