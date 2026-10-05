const express = require("express");
const Visitor = require("../models/Visitor");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

// Mobile number validation: 10 digits
const isValidMobile = (num) => /^\d{10}$/.test(num);

// Email validation (basic)
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// POST /api/visitors — Create visitor (admin + employee)
router.post("/", auth, authorize("admin", "employee"), async (req, res) => {
  try {
    const { visitorName, mobileNumber, email, organization, personToMeet, purpose, visitDateTime } = req.body;

    // Required fields
    if (!visitorName || !mobileNumber || !personToMeet || !purpose || !visitDateTime) {
      return res.status(400).json({ message: "visitorName, mobileNumber, personToMeet, purpose, and visitDateTime are required" });
    }

    // Validate mobile
    if (!isValidMobile(mobileNumber)) {
      return res.status(400).json({ message: "Mobile number must be exactly 10 digits" });
    }

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Generate a simple 6-character alphanumeric visitor code
    const visitorCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const visitor = await Visitor.create({
      visitorName,
      visitorCode,
      mobileNumber,
      email: email || "",
      organization: organization || "",
      personToMeet,
      purpose,
      visitDateTime,
      status: "checked-in",
      checkInTime: new Date(),
    });

    res.status(201).json(visitor);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/visitors — Get all visitors + search (admin + employee)
router.get("/", auth, authorize("admin", "employee"), async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};

    if (search && search.trim()) {
      const term = search.trim();
      // If search is all digits, search by mobile; otherwise by name
      if (/^\d+$/.test(term)) {
        filter.mobileNumber = { $regex: term, $options: "i" };
      } else {
        filter.visitorName = { $regex: term, $options: "i" };
      }
    }

    const visitors = await Visitor.find(filter).sort({ createdAt: -1 });
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/visitors/:id — Update visitor (admin + employee)
router.put("/:id", auth, authorize("admin", "employee"), async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    const { visitorName, mobileNumber, email, organization, personToMeet, purpose, visitDateTime, status } = req.body;

    // Validate mobile if being updated
    if (mobileNumber && !isValidMobile(mobileNumber)) {
      return res.status(400).json({ message: "Mobile number must be exactly 10 digits" });
    }

    // Validate email if being updated
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate status if being updated
    if (status && !["checked-in", "checked-out"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'checked-in' or 'checked-out'" });
    }

    // Handle check-out logic
    if (status === "checked-out" && visitor.status !== "checked-out") {
      const now = new Date();
      if (visitor.checkInTime && now < visitor.checkInTime) {
        return res.status(400).json({ message: "Check-out time cannot be before check-in time" });
      }
      visitor.checkOutTime = now;
    }

    // Update fields if provided
    if (visitorName) visitor.visitorName = visitorName;
    if (mobileNumber) visitor.mobileNumber = mobileNumber;
    if (email !== undefined) visitor.email = email;
    if (organization !== undefined) visitor.organization = organization;
    if (personToMeet) visitor.personToMeet = personToMeet;
    if (purpose) visitor.purpose = purpose;
    if (visitDateTime) visitor.visitDateTime = visitDateTime;
    if (status) visitor.status = status;

    await visitor.save();
    res.json(visitor);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid visitor ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/visitors/:id — Delete visitor (admin only)
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndDelete(req.params.id);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }
    res.json({ message: "Visitor deleted successfully" });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid visitor ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
