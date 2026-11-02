// Dates are local 'YYYY-MM-DD' strings. Weeks start on Sunday.

const pad = (n) => String(n).padStart(2, '0');

export function toDateString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function today() {
  return toDateString(new Date());
}

export function addDays(dateString, days) {
  const date = parseDate(dateString);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

// getDay() is 0 for Sunday, so subtracting it lands on the week's Sunday.
export function weekStart(dateString) {
  return addDays(dateString, -parseDate(dateString).getDay());
}

export function weekDays(dateString) {
  const start = weekStart(dateString);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}
