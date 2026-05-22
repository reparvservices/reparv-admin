export async function fetchDashboardSummary(uri) {
  const response = await fetch(`${uri}/admin/dashboard/summary`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || "Failed to load dashboard");
  }
  if (data.success === false) {
    throw new Error(data.message || "Failed to load dashboard");
  }
  return data;
}

export async function fetchCustomerById(uri, id) {
  const response = await fetch(`${uri}/admin/customers/${id}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to load customer");
  return response.json();
}

export async function fetchCustomerPayments(uri, id) {
  const response = await fetch(`${uri}/admin/customers/payment/get/${id}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to load payments");
  return response.json();
}
