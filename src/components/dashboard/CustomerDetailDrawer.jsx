import { IoMdClose } from "react-icons/io";
import FormatPrice from "../FormatPrice";

export default function CustomerDetailDrawer({
  open,
  onClose,
  customer,
  paymentList,
  totalPaid,
  balancedAmount,
  uri,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[61] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
        onClick={onClose}
      />
      <aside className="relative w-full max-w-[min(100%,700px)] h-full bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-white border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Customer details</h2>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <IoMdClose className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Customer name", value: customer?.customer },
              { label: "Contact", value: customer?.contact },
              { label: "Sales partner", value: customer?.assign },
              {
                label: "Sales commission",
                value: customer?.salescommission != null ? `₹${Number(customer.salescommission).toFixed(2)}` : "—",
              },
              {
                label: "Territory partner",
                value:
                  customer?.territoryName
                    ? `${customer.territoryName} — ${customer.territoryContact || ""}`
                    : "—",
              },
              {
                label: "Territory commission",
                value: customer?.territorycommission != null ? `₹${Number(customer.territorycommission).toFixed(2)}` : "—",
              },
              {
                label: "Deal amount",
                value: customer?.dealamount != null ? <FormatPrice price={customer.dealamount} /> : "—",
              },
              {
                label: "Balance",
                value:
                  balancedAmount != null ? (
                    <FormatPrice price={balancedAmount} />
                  ) : (
                    "—"
                  ),
              },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs font-medium text-gray-500">{field.label}</label>
                <div className="mt-1 text-sm font-semibold text-gray-900 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  {field.value ?? "—"}
                </div>
              </div>
            ))}
          </div>

          {customer?.remark ? (
            <div>
              <label className="block text-xs font-medium text-gray-500">Remark</label>
              <p className="mt-1 text-sm p-3 rounded-lg bg-gray-50 border border-gray-100">{customer.remark}</p>
            </div>
          ) : null}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Payment history</h3>
              <span className="text-sm font-semibold">
                Total paid: <FormatPrice price={totalPaid} />
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {customer?.tokenamount != null && (
                <div className="rounded-xl border p-3 text-sm">
                  <p className="text-xs text-gray-500">Token payment</p>
                  <p className="font-medium mt-1">{customer.paymenttype || "—"}</p>
                  <p className="mt-1">
                    <FormatPrice price={customer.tokenamount} />
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{customer.created_at}</p>
                </div>
              )}
              {paymentList?.map((payment, index) => (
                <div key={index} className="rounded-xl border p-3 text-sm">
                  <p className="text-xs text-gray-500">{payment.paymentType}</p>
                  <p className="mt-1 font-medium">
                    <FormatPrice price={payment.paymentAmount} />
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{payment.created_at}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
