// Converts a 0–10 rating to a 5-star display string.
// Example: 9.0 → "★★★★★",  7.5 → "★★★★☆"
function buildStars(rating) {
  const filled = Math.round(rating / 2);
  const empty  = 5 - filled;
  return "★".repeat(filled) + "☆".repeat(empty);
}

export default buildStars;
