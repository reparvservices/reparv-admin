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

export function formatRelativeUpdated(iso) {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const sec = Math.floor((Date.now() - then) / 1000);
  if (sec < 10) return "Just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
