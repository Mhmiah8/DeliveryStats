// Hourly weights for each hour of the day (0-23)
export const hourWeights = [
  0.03, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01, 0.02,
  0.03, 0.04, 0.03, 0.05, 0.11, 0.09, 0.05, 0.03,
  0.04, 0.06, 0.13, 0.11, 0.07, 0.05, 0.04, 0.03,
];

// Weights for each day of the week (0=Sunday)
export const weekdayWeights = [
  0.06, // Sunday
  0.15, // Monday
  0.16, // Tuesday
  0.17, // Wednesday
  0.18, // Thursday
  0.21, // Friday
  0.07, // Saturday
];

// Weights for each day of the month (1-31)
export const monthDayWeights = [
  0.032, 0.033, 0.035, 0.037, 0.041, 0.029, 0.026, 0.031, 0.034, 0.033,
  0.034, 0.036, 0.038, 0.040, 0.032, 0.033, 0.035, 0.037, 0.036, 0.032,
  0.035, 0.033, 0.037, 0.042, 0.031, 0.028, 0.034, 0.040, 0.024, 0.022,
];

// Returns a scaling weight for the given timeframe based on the current time
export function getTimeWeight(timeframe) {
  const now = new Date();

  if (timeframe === "hour") {
    // For "hour", weight is the fraction of the current hour elapsed (0-1)
    return (now.getMinutes() + now.getSeconds() / 60) / 60;
  }

  if (timeframe === "day") {
    // For "day", use the weight for the current hour (0-23)
    const hour = now.getHours();
    return hourWeights[hour] ?? 1 / 24;
  }

  if (timeframe === "week") {
    // For "week", use the weight for the current weekday (0=Sunday)
    const day = now.getDay();
    return weekdayWeights[day] ?? 1 / 7;
  }

  if (timeframe === "month") {
    // For "month", use the weight for the current day of the month (1-31)
    const day = now.getDate();
    return monthDayWeights[day - 1] ?? 1 / 31;
  }

  return 1; // fallback
}