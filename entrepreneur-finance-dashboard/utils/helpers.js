/**
 * Financial Forecast - Helper Utilities (FIXED VERSION)
 * Core utility functions for formatting, date handling, and calculations
 */

// ========================================
// Currency Formatting
// ========================================

export function formatCurrency(amount, showCents = true) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }
  
  const decimals = showCents ? 2 : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
}

export function parseCurrency(currencyStr) {
  if (!currencyStr) return 0;
  return parseFloat(currencyStr.toString().replace(/[$,]/g, '')) || 0;
}

// ========================================
// Date Formatting & Manipulation
// ========================================

export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getCurrentDate() {
  return formatDate(new Date());
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addWeeks(date, weeks) {
  return addDays(date, weeks * 7);
}

// ✅ FIXED: No longer mutates the original date object
export function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const result = new Date(d);
  result.setDate(diff);
  return result;
}

export function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export function isPastDate(date) {
  if (!date) return false;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

export function isDateBetween(date, startDate, endDate) {
  if (!date || !startDate) return false;
  
  const d = new Date(date);
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date('2099-12-31');
  
  // ✅ FIXED: Check for invalid dates
  if (isNaN(d.getTime()) || isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }
  
  return d >= start && d <= end;
}

// ========================================
// Frequency Calculations
// ========================================

export function getFrequencyPerYear(frequency) {
  const frequencies = {
    'Daily': 365,
    'Weekly': 52,
    'Bi-weekly': 26,
    'Monthly': 12,
    'Quarterly': 4,
    'Annually': 1,
    'One-time': 0
  };
  
  return frequencies[frequency] || 0;
}

export function calculateWeeklyAmount(amount, frequency) {
  if (!amount || frequency === 'One-time') return 0;
  
  const perYear = getFrequencyPerYear(frequency);
  if (perYear === 0) return 0;
  
  return (amount * perYear) / 52;
}

export function calculateMonthlyAmount(amount, frequency) {
  if (!amount || frequency === 'One-time') return 0;
  
  const perYear = getFrequencyPerYear(frequency);
  if (perYear === 0) return 0;
  
  return (amount * perYear) / 12;
}

// ========================================
// Number Formatting
// ========================================

export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

export function formatPercent(num, decimals = 1) {
  if (num === null || num === undefined || isNaN(num)) return '0%';
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num / 100);
}

// ========================================
// Array & Object Utilities
// ========================================

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function deepClone(obj) {
  if (obj === null || obj === undefined) return obj;
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.error('Deep clone failed:', e);
    return obj;
  }
}

export function sortByDate(array, dateProperty, ascending = true) {
  if (!Array.isArray(array)) return [];
  
  return [...array].sort((a, b) => {
    const dateA = new Date(a[dateProperty]);
    const dateB = new Date(b[dateProperty]);
    
    // ✅ FIXED: Handle invalid dates
    if (isNaN(dateA.getTime())) return 1;
    if (isNaN(dateB.getTime())) return -1;
    
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

export function filterByDateRange(array, dateProperty, startDate, endDate) {
  if (!Array.isArray(array)) return [];
  
  return array.filter(item => 
    isDateBetween(item[dateProperty], startDate, endDate)
  );
}

// ========================================
// Validation
// ========================================

export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function isValidNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

// ✅ NEW: Validate category
export function isValidCategory(category, validCategories = ['personal', 'business']) {
  return validCategories.includes(category);
}

// ========================================
// DOM Utilities
// ========================================

export function createElement(tag, attributes = {}, content = '') {
  const element = document.createElement(tag);
  
  Object.keys(attributes).forEach(key => {
    if (key === 'className') {
      element.className = attributes[key];
    } else if (key === 'dataset') {
      Object.keys(attributes[key]).forEach(dataKey => {
        element.dataset[dataKey] = attributes[key][dataKey];
      });
    } else {
      element.setAttribute(key, attributes[key]);
    }
  });
  
  if (content) {
    element.innerHTML = content;
  }
  
  return element;
}

export function show(element) {
  if (element) element.classList.remove('hidden');
}

export function hide(element) {
  if (element) element.classList.add('hidden');
}

export function toggle(element) {
  if (element) element.classList.toggle('hidden');
}

// ========================================
// Debounce & Throttle
// ========================================

export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit = 300) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
