const express = require("express");
const router = express.Router();
const Analytics = require("../models/Analytics");

// GET /api/analytics - fetch global counters
router.get("/", async (req, res) => {
  try {
    const stats = await Analytics.findOne();
    if (!stats) return res.json({ examsCompleted: 0, promisesGenerated: 0 });
    res.json({
      examsCompleted: stats.examsCompleted,
      promisesGenerated: stats.promisesGenerated,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// POST /api/analytics/promise - increment promise counter
router.post("/promise", async (req, res) => {
  try {
    const stats = await Analytics.findOneAndUpdate(
      {},
      { $inc: { promisesGenerated: 1 } },
      { upsert: true, new: true }
    );
    res.json({ promisesGenerated: stats.promisesGenerated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update analytics" });
  }
});

module.exports = router;
