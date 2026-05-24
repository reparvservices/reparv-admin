export {
  resolvePartnerFilterBucket,
  resolvePartnerBucket,
  countPartnerSubscriptionFilters,
  countPartnerBuckets,
  planTypeBadgeClass,
  formatInr,
} from "./partnerSubscriptionDisplay.js";

import { resolvePartnerFilterBucket } from "./partnerSubscriptionDisplay.js";

export function resolvePartnerFilterStatus(item) {
  if (item.changeProjectPartnerReason) return "Partner Change Request";
  return resolvePartnerFilterBucket(item);
}
