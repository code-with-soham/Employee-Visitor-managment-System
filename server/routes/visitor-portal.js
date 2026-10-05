const express = require("express");
const jwt = require("jsonwebtoken");
const Visitor = require("../models/Visitor");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

// POST /api/visitor/login — Visitor Login
router.post("/login", async (req, res) => {
  try {
    const { mobileNumber, visitorCode } = req.body;

    if (!mobileNumber || !visitorCode) {
      return res.status(400).json({ message: "Mobile number and visitor code are required" });
    }

    const visitor = await Visitor.findOne({ mobileNumber, visitorCode });

    if (!visitor) {
      return res.status(401).json({ message: "Invalid credentials or visitor not found" });
    }

    // Generate JWT for visitor
    const token = jwt.sign(
      { id: visitor._id, role: "visitor", mobileNumber: visitor.mobileNumber },
      process.env.JWT_SECRET,
      { expiresIn: "12h" } // Visitors don't need long-lived sessions
    );

    res.json({ token, role: "visitor", message: "Visitor login successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/visitor/dashboard — Get logged in visitor's data
// Requires auth middleware and visitor role
router.get("/dashboard", auth, authorize("visitor"), async (req, res) => {
  try {
    // req.user.id is extracted from the JWT token during auth middleware
    const visitor = await Visitor.findById(req.user.id).select(
      "visitorName mobileNumber email organization personToMeet purpose visitDateTime checkInTime checkOutTime status"
    );

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.json(visitor);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
