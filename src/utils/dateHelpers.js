const moment = require('moment-timezone');

// Set default timezone to Lima
const TIMEZONE = 'America/Lima';

/**
 * Get current date/time in Lima timezone
 */
exports.getNow = () => {
  return moment.tz(TIMEZONE).toDate();
};

/**
 * Get start of day (00:00:00) for a given date in Lima timezone
 */
exports.getStartOfDay = (date) => {
  const targetDate = date ? moment.tz(date, TIMEZONE) : moment.tz(TIMEZONE);
  return targetDate.startOf('day').toDate();
};

/**
 * Get end of day (23:59:59) for a given date in Lima timezone
 */
exports.getEndOfDay = (date) => {
  const targetDate = date ? moment.tz(date, TIMEZONE) : moment.tz(TIMEZONE);
  return targetDate.endOf('day').toDate();
};

/**
 * Check if two dates are on the same day in Lima timezone
 */
exports.isSameDay = (date1, date2) => {
  const d1 = moment.tz(date1, TIMEZONE);
  const d2 = moment.tz(date2, TIMEZONE);
  return d1.format('YYYY-MM-DD') === d2.format('YYYY-MM-DD');
};

/**
 * Group attendance records by day in Lima timezone
 */
exports.groupByDay = (records) => {
  const grouped = {};
  
  records.forEach(record => {
    // Convert timestamp to Lima timezone and get date key
    const dateKey = moment.tz(record.timestamp, TIMEZONE).format('YYYY-MM-DD');
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: dateKey,
        entry: null,
        exit: null,
      };
    }
    
    if (record.attendance_type === 'entry') {
      grouped[dateKey].entry = record;
    } else if (record.attendance_type === 'exit') {
      grouped[dateKey].exit = record;
    }
  });
  
  return Object.values(grouped).sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
};
