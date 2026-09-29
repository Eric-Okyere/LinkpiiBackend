// Shared like/save logic, reused across all 13 listing categories.
//
// A "like" here means "save for later" - the buyer bookmarks a listing so
// they can find it again in their own dashboard. It's intentionally kept
// private (only the listing owner and the person who saved it can see who
// saved what) rather than shown as a public counter, so it can't be used
// as a fake popularity signal and can't be gamed.
//
// toggleLike(Model) and getLikeStatus(Model) are factories: pass in a
// category's mongoose model and get back an Express handler for that
// category. Each route file wires these onto its own router, e.g.:
//   const { toggleLike, getLikeStatus } = require('../controllers/Likes');
//   router.post('/:id/like', toggleLike(Product));
//   router.get('/:id/like', getLikeStatus(Product));

function toggleLike(Model) {
  return async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    try {
      const doc = await Model.findById(id).select('likedBy');
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Listing not found' });
      }

      const alreadyLiked = doc.likedBy.some((u) => u.toString() === userId);

      if (alreadyLiked) {
        doc.likedBy.pull(userId);
      } else {
        doc.likedBy.push(userId);
      }
      await doc.save();

      return res.status(200).json({
        success: true,
        liked: !alreadyLiked,
        likesCount: doc.likedBy.length,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
}

function getLikeStatus(Model) {
  return async (req, res) => {
    const { id } = req.params;
    const { userId } = req.query;

    try {
      const doc = await Model.findById(id).select('likedBy');
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Listing not found' });
      }

      const liked = !!userId && doc.likedBy.some((u) => u.toString() === userId);

      return res.status(200).json({
        success: true,
        liked,
        likesCount: doc.likedBy.length,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
}

module.exports = { toggleLike, getLikeStatus };
