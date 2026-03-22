const express = require("express");
const router = express.Router();
const User = require("../models/User");

// POST /api/users - register a user
router.post("/", async (req, res) => {
  const { name, email, party, state, reason } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  try {
    const user = await User.create({ name, email, party, state, reason });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: "Failed to register user" });
  }
});

// GET /api/users - list all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-__v").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = router;
