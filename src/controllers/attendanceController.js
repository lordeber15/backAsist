const Attendance = require('../models/Attendance');
const GeographicPoint = require('../models/GeographicPoint');
const { getDistanceFromLatLonInMeters } = require('../utils/geo');
const { getStartOfDay, getEndOfDay, groupByDay } = require('../utils/dateHelpers');
const { Op } = require('sequelize');

exports.recordAttendance = async (req, res) => {
  try {
    const { latitude, longitude, gps_accuracy, device_model } = req.body;
    const userId = req.user.id;

    // Validate photo upload
    if (!req.file) {
      return res.status(400).json({ message: 'Photo is required for attendance' });
    }

    // Check today's records
    const todayStart = getStartOfDay();
    const todayEnd = getEndOfDay();

    const todayRecords = await Attendance.findAll({
      where: {
        user_id: userId,
        timestamp: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
      order: [['timestamp', 'ASC']],
    });

    // Validate daily limit (max 2 records: entry + exit)
    if (todayRecords.length >= 2) {
      return res.status(400).json({
        message: 'Ya registraste entrada y salida hoy. No puedes registrar más asistencias.',
      });
    }

    // Determine attendance type
    const attendanceType = todayRecords.length === 0 ? 'entry' : 'exit';

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

    // Save record with photo path, attendance type, and Lima timezone timestamp
    const moment = require('moment-timezone');
    const limaTime = moment.tz('America/Lima').toDate();
    
    const attendance = await Attendance.create({
      user_id: userId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      gps_accuracy: parseFloat(gps_accuracy),
      calculated_distance: distance,
      validation_status: status,
      device_model,
      photo_path: req.file.path,
      attendance_type: attendanceType,
      timestamp: limaTime,
    });

    const typeLabel = attendanceType === 'entry' ? 'Entrada' : 'Salida';

    if (isValid) {
      res.status(201).json({
        message: `${typeLabel} registrada exitosamente`,
        record: attendance,
        attendance_type: attendanceType,
      });
    } else {
      res.status(400).json({
        message: `${typeLabel} registrada pero estás fuera del rango permitido`,
        record: attendance,
        attendance_type: attendanceType,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await Attendance.findAll({
      where: { user_id: userId },
      order: [['timestamp', 'DESC']],
    });

    // Group by day
    const grouped = groupByDay(history);

    res.json({
      total: history.length,
      grouped: grouped,
      raw: history,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTodayStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const todayStart = getStartOfDay();
    const todayEnd = getEndOfDay();

    const todayRecords = await Attendance.findAll({
      where: {
        user_id: userId,
        timestamp: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
      order: [['timestamp', 'ASC']],
    });

    const entry = todayRecords.find(r => r.attendance_type === 'entry');
    const exit = todayRecords.find(r => r.attendance_type === 'exit');

    res.json({
      has_entry: !!entry,
      has_exit: !!exit,
      can_register: todayRecords.length < 2,
      next_type: todayRecords.length === 0 ? 'entry' : todayRecords.length === 1 ? 'exit' : null,
      entry: entry || null,
      exit: exit || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
