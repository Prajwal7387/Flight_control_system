/**
 * Validate required fields in a form data object
 * @param {Object} data - Form data
 * @param {Array} requiredFields - Array of { key, label } for required fields
 * @returns {Object} - { isValid, errors }
 */
export function validateRequired(data, requiredFields) {
  const errors = {};
  let isValid = true;

  requiredFields.forEach(({ key, label }) => {
    const value = data[key];
    if (value === null || value === undefined || String(value).trim() === '') {
      errors[key] = `${label} is required.`;
      isValid = false;
    }
  });

  return { isValid, errors };
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  if (!email) return 'Email is required.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Please enter a valid email address.';
  return null;
}

/**
 * Validate that a number is positive
 */
export function validatePositiveNumber(value, fieldName) {
  if (value === null || value === undefined || value === '') return `${fieldName} is required.`;
  const num = Number(value);
  if (isNaN(num) || num <= 0) return `${fieldName} must be a positive number.`;
  return null;
}

/**
 * Validate phone number (basic)
 */
export function validatePhone(phone) {
  if (!phone) return null; // Phone is optional
  const re = /^[+]?[\d\s-]{7,15}$/;
  if (!re.test(phone)) return 'Please enter a valid phone number.';
  return null;
}

/**
 * Validate that departure is before arrival
 */
export function validateFlightTimes(departureDate, departureTime, arrivalDate, arrivalTime) {
  if (!departureDate || !departureTime || !arrivalDate || !arrivalTime) return null;
  
  const dep = new Date(`${departureDate}T${departureTime}`);
  const arr = new Date(`${arrivalDate}T${arrivalTime}`);
  
  if (arr <= dep) return 'Arrival must be after departure.';
  return null;
}
