const express = require('express');
const { Product } = require('../../models/products/Fashion');
const { Viwers } = require('../../models/comment/Viewers');


const router = express.Router();

// Add a comment to a product
router.post('/:productId/view', async (req, res) => {
  const { productId } = req.params;
  const {userId, name, phone } = req.body;

  try {
    const comment = new Viwers({ user: userId, name, phone });
    await comment.save();

    const product = await Product.findById(productId);
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

// router.post('/', async (req, res) => {
//     const { name, phone, email, receiverphone, recname } = req.body;

//     try {
//         // Create a new Airtel record
//         const caller = new Call({ name, phone, email, receiverphone, recname });
        
//         // Save the Airtel record to the database
//         await caller.save();

//         return res.status(201).json(caller);
//     } catch (error) {
//         console.error('Error creating caller record:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// });


router.get('/comments/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId).populate({
      path: 'viewers',
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

  
    const product = await Product.findOneAndUpdate(
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
  