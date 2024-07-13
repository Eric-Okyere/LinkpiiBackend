// controllers/commentController.js

const toxicKeywords = require('../../controllers/keywords');

const analyzeComment = (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const lowerCaseText = text.toLowerCase();
  let isToxic = false;

  for (const keyword of toxicKeywords) {
    if (lowerCaseText.includes(keyword)) {
      isToxic = true;
      break;
    }
  }

  res.json({ isToxic });
};

module.exports = { analyzeComment };
