export function assessSpend({ amount, perTransaction, windowCap, used, principal, floor, revoked }) {
  const quantities = [amount, perTransaction, windowCap, used, principal, floor];
  const remaining = Math.max(0, windowCap - used - amount);
  if (quantities.some(value => !Number.isFinite(value) || value < 0)) return { allowed: false, reason: 'Enter a valid quantity', remaining: 0 };
  if (revoked) return { allowed: false, reason: 'Owner revoked agent access', remaining };
  if (amount > perTransaction) return { allowed: false, reason: 'Per-transaction cap exceeded', remaining };
  if (amount + used > windowCap) return { allowed: false, reason: 'Rolling-window cap exceeded', remaining };
  if (principal - amount < floor) return { allowed: false, reason: 'Principal floor would be breached', remaining };
  return { allowed: true, reason: 'Within all illustrated limits', remaining };
}

export function slideFromHash(hash, count) {
  if (!/^#[1-9]\d*$/.test(hash)) return 0;
  const number = Number(hash.slice(1));
  return number <= count ? number - 1 : 0;
}

export function nextSlide(current, direction, count) {
  return Math.max(0, Math.min(count - 1, current + direction));
}
