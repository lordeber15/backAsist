const Attendance = require('../models/Attendance');
const GeographicPoint = require('../models/GeographicPoint');
const { getDistanceFromLatLonInMeters } = require('../utils/geo');

exports.recordAttendance = async (req, res) => {
  try {
    const { latitude, longitude, gps_accuracy, device_model } = req.body;
    const userId = req.user.id;

    // Validate photo upload
    if (!req.file) {
      return res.status(400).json({ message: 'Photo is required for attendance' });
    }

    // Get active geographic point
    const activePoint = await GeographicPoint.findOne({ where: { status: 'active' } });

    if (!activePoint) {
      return res.status(404).json({ message: 'No active geographic point configured' });
    }

    // Calculate distance
    const distance = getDistanceFromLatLonInMeters(
      parseFloat(latitude),
      parseFloat(longitude),
      activePoint.latitude,
      activePoint.longitude
    );

    // Validate
    const isValid = distance <= activePoint.radius_meters;
    const status = isValid ? 'VALID' : 'INVALID';

    // Save record with photo path
    const attendance = await Attendance.create({
      user_id: userId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      gps_accuracy: parseFloat(gps_accuracy),
      calculated_distance: distance,
      validation_status: status,
      device_model,
      photo_path: req.file.path,
    });

    if (isValid) {
      res.status(201).json({ message: 'Attendance recorded successfully', record: attendance });
    } else {
      res.status(400).json({ message: 'You are outside the allowed range', record: attendance });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await Attendance.findAll({ where: { user_id: userId }, order: [['timestamp', 'DESC']] });
        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
