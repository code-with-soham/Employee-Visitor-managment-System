const express = require("express");
const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

// All routes here require: logged in + admin role
router.use(auth, authorize("admin"));

// POST /api/employees — Create employee
router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check duplicate email
    const existing = await Employee.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Employee with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await Employee.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      isActive: employee.isActive,
      createdAt: employee.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/employees — Get all employees
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().select("-password").sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/employees/:id — Update employee
router.put("/:id", async (req, res) => {
  try {
    const { name, email, password, isActive } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Check duplicate email if email is being changed
    if (email && email.toLowerCase() !== employee.email) {
      const existing = await Employee.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ message: "Employee with this email already exists" });
      }
      employee.email = email;
    }

    if (name) employee.name = name;
    if (typeof isActive === "boolean") employee.isActive = isActive;

    if (password) {
      employee.password = await bcrypt.hash(password, 10);
    }

    await employee.save();

    res.json({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      isActive: employee.isActive,
      updatedAt: employee.updatedAt,
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid employee ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/employees/:id — Deactivate employee (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (!employee.isActive) {
      return res.status(400).json({ message: "Employee is already deactivated" });
    }

    employee.isActive = false;
    await employee.save();

    res.json({ message: "Employee deactivated successfully" });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid employee ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
