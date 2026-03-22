const express = require("express");
const router = express.Router();
const LeaderboardEntry = require("../models/LeaderboardEntry");
const Analytics = require("../models/Analytics");

// GET /api/leaderboard - top 20 scores
router.get("/", async (req, res) => {
  try {
    const entries = await LeaderboardEntry.find()
      .sort({ score: -1, timestamp: 1 })
      .limit(20);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// POST /api/leaderboard - submit a score
router.post("/", async (req, res) => {
  const { name, score } = req.body;

  if (!name || score === undefined) {
    return res.status(400).json({ error: "name and score are required" });
  }

  try {
    const entry = await LeaderboardEntry.create({ name, score });

    // Increment exams completed counter
    await Analytics.findOneAndUpdate(
      {},
      { $inc: { examsCompleted: 1 } },
      { upsert: true, new: true }
    );

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: "Failed to save score" });
  }
});

module.exports = router;
