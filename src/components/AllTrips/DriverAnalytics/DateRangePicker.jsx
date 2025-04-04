// DateRangePicker.js
import React from 'react';

const DateRangePicker = ({ startDate, endDate, onChange }) => {
  const handleStartDateChange = (e) => {
    onChange(e.target.value, endDate);
  };
  
  const handleEndDateChange = (e) => {
    onChange(startDate, e.target.value);
  };
  
  return (
    <div className="flex items-center space-x-2">
      <input
        type="date"
        className="border border-gray-300 rounded-md p-1.5 text-sm"
        value={startDate}
        onChange={handleStartDateChange}
      />
      <span className="text-gray-500">to</span>
      <input
        type="date"
        className="border border-gray-300 rounded-md p-1.5 text-sm"
        value={endDate}
        onChange={handleEndDateChange}
      />
    </div>
  );
};

export default DateRangePicker;