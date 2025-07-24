// Utility to normalize and capitalize delivery app names
export function normalizeAppName(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/just\s*eat/i, "Just Eat")
    .replace(/uber\s*eats/i, "Uber Eats")
    .replace(/deliveroo/i, "Deliveroo")
    .replace(/foodhub/i, "Foodhub")
    .replace(/zapp/i, "Zapp")
    .replace(/dishpatch/i, "Dishpatch") // Added for new app
    .replace(/gophr/i, "Gophr")         // Added for new app
    .replace(/snappy\s*shopper/i, "Snappy Shopper") // Added for new app
    .replace(/\b\w/g, (c) => c.toUpperCase());
}