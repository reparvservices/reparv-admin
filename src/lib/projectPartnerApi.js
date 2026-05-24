const FILTER_LABEL_TO_PARAM = {
  "Follow Up": "follow_up",
  Unpaid: "unpaid",
  Trial: "trial",
  Paid: "paid",
  Enterprise: "enterprise",
  Pending: "pending",
};

export function partnerFilterToApiParam(label) {
  if (!label || label === "All") return "";
  return FILTER_LABEL_TO_PARAM[label] || "";
}

export async function fetchProjectPartnerList(URI, params = {}) {
  const qs = new URLSearchParams();
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.offset != null) qs.set("offset", String(params.offset));
  if (params.search) qs.set("search", params.search);
  if (params.filter) qs.set("filter", params.filter);
  if (params.dateFrom) qs.set("date_from", params.dateFrom);
  if (params.dateTo) qs.set("date_to", params.dateTo);

  const res = await fetch(`${URI}/admin/projectpartner/list?${qs}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || "Failed to fetch project partners");
  }
  return json;
}
