export const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const formatINR = (value, { compact = false, decimals = 2 } = {}) => {
  const n = toNumber(value);
  if (compact && n >= 10000000) {
    return `₹${(n / 10000000).toFixed(2)} Cr`;
  }
  if (compact && n >= 100000) {
    return `₹${(n / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
};

export const formatCount = (value) =>
  toNumber(value).toLocaleString("en-IN");

export const formatPercent = (value) => `${toNumber(value).toFixed(1)}%`;

export function buildBusinessMetrics(counts = {}) {
  const totalRevenue = toNumber(counts.totalDealAmount);
  const totalDeals = toNumber(counts.totalCustomer);
  const salesCommission = toNumber(counts.totalSalesCommission);
  const territoryCommission = toNumber(counts.totalTerritoryCommission);
  const reparvCommission = toNumber(counts.totalReparvCommission);
  const tds = toNumber(counts.totalTDS);
  const totalCommission = toNumber(counts.totalCommission);

  const totalExpenses = tds + salesCommission + territoryCommission;
  const marketingSpend = Math.max(0, totalCommission - reparvCommission);
  const netProfitLoss = reparvCommission - totalExpenses;
  const roi = totalRevenue > 0 ? (netProfitLoss / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalDeals,
    salesCommission,
    territoryCommission,
    reparvCommission,
    tds,
    totalCommission,
    totalExpenses,
    marketingSpend,
    netProfitLoss,
    roi,
    sqFt: toNumber(counts.totalDealInSquareFeet),
  };
}
