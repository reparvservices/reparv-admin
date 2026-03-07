export const formatNumber = (num) => {
  if (!num) return 0;

  if (num >= 10000000) return (num / 10000000).toFixed(1).replace(".0", "") + "Cr";
  if (num >= 100000) return (num / 100000).toFixed(1).replace(".0", "") + "L";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(".0", "") + "K";

  return num;
};