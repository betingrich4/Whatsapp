// lib/warnUser.js
const userWarnings = new Map();

export const warnUser = (userId) => {
  const warnings = userWarnings.get(userId) || 0;
  userWarnings.set(userId, warnings + 1);
  return warnings + 1;
};

export const resetWarnings = (userId) => {
  userWarnings.delete(userId);
};
