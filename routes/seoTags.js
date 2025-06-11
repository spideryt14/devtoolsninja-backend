const express = require("express");
const router = express.Router();
const axios = require("axios"); // DeepSeek API call করতে লাগবে

router.post("/", async (req, res) => {
  const { topic } = req.body;

  if (!topic) return res.status(400).json({ error: "Topic dite hobe!" });

  try {
    const response = await axios.post("https://api.deepseek.com/v1/chat/completions", {
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: `Give me 30 SEO tags for the topic: ${topic}`,
        }
      ]
    }, {
      headers: {
        Authorization: `Bearer YOUR_DEEPSEEK_API_KEY`,
        "Content-Type": "application/json"
      }
    });

    const aiResponse = response.data.choices[0].message.content;
    const tags = aiResponse.split(/,|\n/).map(t => t.trim()).filter(t => t);

    res.json({ tags }); // frontend এ পাঠিয়ে দিলাম
  } catch (err) {
    res.status(500).json({ error: "DeepSeek API error", message: err.message });
  }
});

module.exports = router;
