const express = require("express");
const router = express.Router();
const axios = require("axios");
require('dotenv').config(); // environment variable load

router.post("/", async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Topic dite hobe!" });
  }

  try {
    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: `Give me 30 SEO tags for the topic: ${topic}`,
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    // ভেঙে Tag বানাচ্ছি
    const tags = aiResponse
      .split(/,|\n/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    res.json({ success: true, tags });
  } catch (err) {
    console.error("❌ DeepSeek API error:", err.message);
    res.status(500).json({ 
      success: false,
      error: "DeepSeek API error", 
      message: err.message 
    });
  }
});

module.exports = router;
