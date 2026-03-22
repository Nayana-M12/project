const mongoose = require("mongoose");

// Single document that tracks global counters
const analyticsSchema = new mongoose.Schema({
  examsCompleted: { type: Number, default: 0 },
  promisesGenerated: { type: Number, default: 0 },
});

module.exports = mongoose.model("Analytics", analyticsSchema);
