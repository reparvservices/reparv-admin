/** Client-side mirror of server partner subscription filter + display fields. */

export function resolvePartnerFilterBucket(item) {
  if (item?.subscription_filter) return item.subscription_filter;
  if (item?.subscription_bucket) return item.subscription_bucket;

  if (item?.paymentstatus === "Follow Up" && item?.loginstatus === "Inactive") {
    return "Follow Up";
  }
  if (item?.paymentstatus === "Success") return "Paid";
  if (item?.freeProjectPartner === "Active") return "Trial";
  return "Unpaid";
}

export function countPartnerSubscriptionFilters(data, { includeRequest = false } = {}) {
  const acc = {
    Unpaid: 0,
    FollowUp: 0,
    Trial: 0,
    Paid: 0,
    Enterprise: 0,
    Pending: 0,
    Expired: 0,
    Cancelled: 0,
  };
  if (includeRequest) acc.Request = 0;

  return (data || []).reduce((counts, item) => {
    if (includeRequest && item.changeProjectPartnerReason) {
      counts.Request++;
      return counts;
    }
    const bucket = resolvePartnerFilterBucket(item);
    if (bucket === "Follow Up") counts.FollowUp++;
    else if (bucket === "Trial") counts.Trial++;
    else if (bucket === "Paid") counts.Paid++;
    else if (bucket === "Enterprise") counts.Enterprise++;
    else if (bucket === "Pending") counts.Pending++;
    else if (bucket === "Expired") counts.Expired++;
    else if (bucket === "Cancelled") counts.Cancelled++;
    else counts.Unpaid++;
    return counts;
  }, acc);
}

/** @deprecated use resolvePartnerFilterBucket */
export function resolvePartnerBucket(item) {
  return resolvePartnerFilterBucket(item);
}

/** @deprecated use countPartnerSubscriptionFilters */
export function countPartnerBuckets(data, options) {
  const c = countPartnerSubscriptionFilters(data, options);
  return {
    Unpaid: c.Unpaid,
    FollowUp: c.FollowUp,
    Paid: c.Paid,
    Free: c.Trial,
    Request: c.Request,
    Trial: c.Trial,
    Enterprise: c.Enterprise,
    Pending: c.Pending,
  };
}

export function planTypeBadgeClass(planType, row) {
  const pt = String(planType || row?.subscription_plan_type || "").toLowerCase();
  if (pt === "enterprise" || row?.subscription_is_enterprise) {
    return "bg-slate-200 text-slate-800";
  }
  if (pt === "trial" || row?.subscription_is_trial) {
    return "bg-violet-100 text-violet-800";
  }
  if (pt === "paid") return "bg-emerald-100 text-emerald-800";
  return "bg-gray-100 text-gray-600";
}

export function formatInr(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}
