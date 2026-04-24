const express = require("express");
const router = express.Router();
const { getPredictions, getSmartReplies } = require("../utils/gemini");

// 🔮 typing suggestions
router.post("/predict", async (req, res) => {
    const { text } = req.body;

    if (!text) return res.json([]);

    const suggestions = await getPredictions(text);
    res.json(suggestions);
});

// 💬 smart replies
router.post("/reply", async (req, res) => {
    const { message } = req.body;

    if (!message) return res.json([]);

    const replies = await getSmartReplies(message);
    res.json(replies);
});

module.exports = router;