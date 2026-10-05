const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "EVMS API is running" });
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/employees", require("./routes/employees"));
app.use("/api/visitors", require("./routes/visitors"));
app.use("/api/visitor", require("./routes/visitor-portal"));

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
