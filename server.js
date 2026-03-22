require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/leaderboard", require("./src/routes/leaderboard"));
app.use("/api/users", require("./src/routes/users"));
app.use("/api/analytics", require("./src/routes/analytics"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Politician Entrance Coaching Portal API" });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
