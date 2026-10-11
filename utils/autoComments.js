const User = require("../models/user");
const { Comment } = require("../models/comment/comment");

// A small pool of placeholder "customer" accounts used to seed generic,
// positive comments on listings so new or empty listings don't look dead.
// Each one is tagged with a clearly internal @linkpii.auto email so they
// stay identifiable/manageable later - the display name is the only field
// buyers ever actually see (every comment route only ever populates
// `user` with `select: 'name'`, see routes/Coments/*.js).
const AUTO_COMMENT_USERS = [
  { name: "Kwame A.", email: "auto.reviewer1@linkpii.auto" },
  { name: "Ama B.", email: "auto.reviewer2@linkpii.auto" },
  { name: "Kofi O.", email: "auto.reviewer3@linkpii.auto" },
  { name: "Akosua M.", email: "auto.reviewer4@linkpii.auto" },
  { name: "Yaw T.", email: "auto.reviewer5@linkpii.auto" },
  { name: "Efua D.", email: "auto.reviewer6@linkpii.auto" },
  { name: "Kwabena S.", email: "auto.reviewer7@linkpii.auto" },
  { name: "Abena N.", email: "auto.reviewer8@linkpii.auto" },
];

// Generic enough to read naturally under a product, a service, a vehicle,
// a rental or a listing for property - nothing category-specific.
const AUTO_COMMENT_PHRASES = [
  "Great find, exactly as described!",
  "Fast response and smooth transaction.",
  "Really happy with this, thank you!",
  "Good quality for the price.",
  "Would definitely recommend.",
  "Seller was quick to respond.",
  "Exactly what I was looking for.",
  "No issues at all, very satisfied.",
  "Nice and straightforward deal.",
  "Impressed with the quality.",
  "Everything went smoothly, thanks!",
  "Solid choice, no complaints.",
  "Quick and great service.",
  "Very professional, thank you.",
  "Happy with this, thanks so much!",
  "Worth it, no regrets.",
];

let cachedUserIds = null;

// Idempotent: upserts the placeholder accounts by email (safe to call many
// times, or from multiple server instances) and returns their ids, cached
// in memory after the first call in this process.
async function getAutoCommentUserIds() {
  if (cachedUserIds) return cachedUserIds;

  const ids = await Promise.all(
    AUTO_COMMENT_USERS.map(async ({ name, email }) => {
      const user = await User.findOneAndUpdate(
        { email },
        {
          $setOnInsert: {
            name,
            lastname: "Auto",
            email,
            admin: false,
            verified: true,
            isGoogleUser: true, // skips the password-required validator
          },
        },
        { upsert: true, new: true }
      );
      return user._id;
    })
  );

  cachedUserIds = ids;
  return ids;
}

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Posts one generic, positive auto-comment on a listing. `CommentModel`
// defaults to the shared Comment model used by every category except
// Food, which keeps its own Foodcomment model (see
// routes/Coments/FoodComment.js) - pass that in explicitly for Food
// listings. Never throws: a failure here should never block an approval
// or a backfill run, same convention as notifyWebUsers/sendPushToAll.
async function postAutoComment(ListingModel, listingId, CommentModel = Comment) {
  try {
    const userIds = await getAutoCommentUserIds();
    const comment = await CommentModel.create({
      user: randomFrom(userIds),
      content: randomFrom(AUTO_COMMENT_PHRASES),
    });
    await ListingModel.findByIdAndUpdate(listingId, { $push: { comments: comment._id } });
  } catch (error) {
    console.error("Error posting auto comment:", error);
  }
}

module.exports = { postAutoComment, getAutoCommentUserIds, AUTO_COMMENT_PHRASES };
