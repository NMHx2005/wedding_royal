/** PayOS amounts are in VND; allow 1đ tolerance for rounding. */
export function payosAmountMatchesOrder(orderAmount: number, payosAmount: number): boolean {
  if (!Number.isFinite(orderAmount) || !Number.isFinite(payosAmount)) return false;
  return Math.abs(orderAmount - payosAmount) <= 1;
}
