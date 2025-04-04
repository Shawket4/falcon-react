// File: utils/dateUtils.js

// Parse ISO date string to Date object
export const parseISO = (dateStr) => {
    // Handles various date formats
    const date = new Date(dateStr);
    return isNaN(date) ? null : date;
  };
  
  // Format date according to specified format string
  export const format = (date, formatStr) => {
    if (!date) return '';
    
    const d = new Date(date);
    
    switch(formatStr) {
      case 'yyyy-MM-dd':
        return d.toISOString().split('T')[0];
      case 'MMM dd, yyyy':
        return d.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      case 'MMM d':
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      default:
        return d.toISOString();
    }
  };
  
  // Check if a date is within given interval
  export const isWithinInterval = (date, { start, end }) => {
    if (!date || !start || !end) return true;
    return date >= start && date <= end;
  };
  
  // Format a number as currency
  export const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Format a number with commas and specified decimal places
  export const formatNumber = (value, decimals = 1) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };
  
  // Format odometer value
  export const formatOdometer = (value) => {
    if (!value) return 'N/A';
    const numValue = parseFloat(value);
    return isNaN(numValue) ? 'N/A' : numValue.toLocaleString() + ' km';
  };
  
  // Utility function for text normalization
  export const normalizeText = (text) => {
    if (!text) return '';
    
    const normalizationMap = {
      'آ': 'ا', 'أ': 'ا', 'إ': 'ا', 'ٱ': 'ا',
      'ي': 'ى', 'ئ': 'ى',
      'ؤ': 'و',
      'ة': 'ه',
      'ً': '', 'ٌ': '', 'ٍ': '', 'َ': '', 'ُ': '', 'ِ': '', 
      'ّ': '', 'ْ': '', 'ٰ': '', 'ٓ': '', 'ٔ': '', 'ٕ': '',
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', 
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };
    
    return text.split('').map(char => 
      normalizationMap[char] || char
    ).join('').trim().toLowerCase();
  };