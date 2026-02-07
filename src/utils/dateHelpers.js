// Helper functions for date operations

/**
 * Get start of day (00:00:00) for a given date
 */
exports.getStartOfDay = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

/**
 * Get end of day (23:59:59) for a given date
 */
exports.getEndOfDay = (date = new Date()) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

/**
 * Check if two dates are on the same day
 */
exports.isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Group attendance records by day
 */
exports.groupByDay = (records) => {
  const grouped = {};
  
  records.forEach(record => {
    const dateKey = new Date(record.timestamp).toISOString().split('T')[0];
    
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
