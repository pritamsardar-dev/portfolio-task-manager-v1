// Persist daily tracked time by date.
// Required because task totals alone cannot determine
// how much time belongs to a specific calendar day.

const DAILY_TIME_KEY = "taskflow-daily-time";

// Return YYYY-MM-DD for the given date
export function getDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

// Read the full daily time map
export function getDailyTimeMap() {
  try {
    return JSON.parse(localStorage.getItem(DAILY_TIME_KEY)) || {};
  } catch {
    return {};
  }
}

// Add seconds to the given date bucket
export function addDailyTime(dateKey, seconds) {
  if (!seconds || seconds <= 0) return;

  try {
    const map = getDailyTimeMap();

    map[dateKey] = (map[dateKey] || 0) + Math.floor(seconds);

    localStorage.setItem(DAILY_TIME_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage failures
  }
}
