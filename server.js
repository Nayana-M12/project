require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve frontend static files
app.use(express.static(__dirname));

// Routes
app.use("/api/leaderboard", require("./src/routes/leaderboard"));
app.use("/api/users", require("./src/routes/users"));
app.use("/api/analytics", require("./src/routes/analytics"));

// Serve index.html for root
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
