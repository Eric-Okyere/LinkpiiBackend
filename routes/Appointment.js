const express = require("express");
const router = express.Router();
const Appointment = require("../models/Car/Appointment");

// ✅ Create an appointment
router.post("/", async (req, res) => {
  console.log("Request body:", req.body);
  try {
    const { username, userphone, drivername, driverphone, time, datepick, userlocation, region, location, desregion, deslocation } = req.body;
    const newAppointment = new Appointment({ username, userphone, drivername, driverphone, time, datepick, userlocation, region, location, desregion, deslocation });
    // Validate required fields
    // if (!username || !userphone || !drivername || !driverphone || !time || !datepick || !userlocation || !region || !location) {
    //   return res.status(400).json({ error: "All fields are required" });
    // }
    const savedAppointment = await newAppointment.save();
    res.status(201).json(savedAppointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get a single appointment by ID
router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update an appointment by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedAppointment) return res.status(404).json({ error: "Appointment not found" });
    res.json(updatedAppointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete an appointment by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!deletedAppointment) return res.status(404).json({ error: "Appointment not found" });
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/:id/restrict", async (req, res) => {
    try {
      const appointment = await Appointment.findById(req.params.id);
      if (!appointment) return res.status(404).json({ error: "Appointment not found" });
  
      // Check if the appointment was created within the last 30 minutes
      const createdAt = new Date(appointment.date);
      const now = new Date();
      const minutesDiff = (now - createdAt) / (1000 * 60); // Convert milliseconds to minutes
  
      if (minutesDiff > 30) {
        return res.status(403).json({ error: "You can only delete within 30 minutes of creation.Please contact Linkpii " });
      }
  
      // Proceed with deletion if within 30 minutes
      await Appointment.findByIdAndDelete(req.params.id);
      res.json({ message: "Appointment deleted successfully" });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

module.exports = router;
