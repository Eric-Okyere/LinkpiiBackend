const express = require('express');
const { Comment } = require('../../models/comment/comment');
const { Mechanics } = require('../../models/Mechanics/Mechanicsmodel');



const router = express.Router();

// Add a comment to a product
router.post('/:productId/comments', async (req, res) => {
  const { productId } = req.params;
  const { userId, content } = req.body;

  try {
    const comment = new Comment({ user: userId, content });
    await comment.save();

    const product = await Mechanics.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.comments.push(comment._id);
    await product.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/comments/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Mechanics.findById(productId).populate({
      path: 'comments',
      options: { sort: { dateCreated: -1 } },
      populate: {
        path: 'user',
        select: 'name'
      }
    })

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



router.put('/comments/:commentId', async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Update the comment content
    comment.content = content;
    await comment.save();

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


  
router.delete('/comments/:commentId', async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

  
    const product = await Mechanics.findOneAndUpdate(
      { comments: commentId },
      { $pull: { comments: commentId } }
    );

   
    await Comment.findByIdAndRemove(commentId);

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});






  module.exports = router;
  