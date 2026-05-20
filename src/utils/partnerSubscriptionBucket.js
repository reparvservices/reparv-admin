/** Match server subscription_bucket; fallback for older API responses. */
export function resolvePartnerBucket(item) {
  if (item?.subscription_bucket) return item.subscription_bucket;

  if (item?.paymentstatus === "Success") return "Paid";
  if (item?.paymentstatus === "Follow Up" && item?.loginstatus === "Inactive") {
    return "Follow Up";
  }
  if (item?.paymentstatus === "Pending") return "Unpaid";
  if (item?.paymentstatus !== "Success" && item?.loginstatus === "Active") {
    return "Free";
  }
  return "Unpaid";
}

export function countPartnerBuckets(data, { includeRequest = false } = {}) {
  const acc = { Unpaid: 0, FollowUp: 0, Paid: 0, Free: 0 };
  if (includeRequest) acc.Request = 0;

  return (data || []).reduce((counts, item) => {
    if (includeRequest && item.changeProjectPartnerReason) {
      counts.Request++;
      return counts;
    }
    const bucket = resolvePartnerBucket(item);
    if (bucket === "Paid") counts.Paid++;
    else if (bucket === "Follow Up") counts.FollowUp++;
    else if (bucket === "Free") counts.Free++;
    else counts.Unpaid++;
    return counts;
  }, acc);
}

export function resolvePartnerFilterStatus(item) {
  if (item.changeProjectPartnerReason) return "Partner Change Request";
  return resolvePartnerBucket(item);
}
