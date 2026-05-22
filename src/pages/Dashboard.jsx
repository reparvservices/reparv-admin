import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../store/auth";
import {
  fetchDashboardSummary,
  fetchCustomerById,
  fetchCustomerPayments,
} from "../lib/dashboardApi";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardKpiStrip from "../components/dashboard/DashboardKpiStrip";
import DashboardBusinessOverview from "../components/dashboard/DashboardBusinessOverview";
import DashboardInsightPanels from "../components/dashboard/DashboardInsightPanels";
import DashboardStatGrid from "../components/dashboard/DashboardStatGrid";
import DashboardRecentCustomers from "../components/dashboard/DashboardRecentCustomers";
import DashboardRecentSubscriptions from "../components/dashboard/DashboardRecentSubscriptions";
import CustomerDetailDrawer from "../components/dashboard/CustomerDetailDrawer";

const AUTO_REFRESH_MS = 45_000;

function DashboardError({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <p className="text-sm text-red-800">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="text-sm font-semibold text-red-700 hover:underline shrink-0 cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}

export default function Dashboard() {
  const { URI, setLoading } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLocalLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

  const [showCustomer, setShowCustomer] = useState(false);
  const [customer, setCustomer] = useState({});
  const [paymentList, setPaymentList] = useState([]);
  const [totalPaid, setTotalPaid] = useState(null);
  const [balancedAmount, setBalancedAmount] = useState(null);

  const calculateBalance = useCallback((payments = [], row) => {
    const tokenAmount = Number(row?.tokenamount) || 0;
    const dealAmount = Number(row?.dealamount) || 0;
    const paid = payments.reduce(
      (sum, p) => sum + (Number(p.paymentAmount) || 0),
      tokenAmount,
    );
    setTotalPaid(paid);
    setBalancedAmount(dealAmount - paid);
  }, []);

  const loadSummary = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setLocalLoading(true);
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError("");

      try {
        const data = await fetchDashboardSummary(URI);
        if (!mountedRef.current) return;
        setSummary(data);
      } catch (err) {
        if (!mountedRef.current) return;
        setError(err.message || "Could not load dashboard data.");
        if (!silent) setSummary(null);
      } finally {
        if (!mountedRef.current) return;
        if (!silent) {
          setLocalLoading(false);
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    },
    [URI, setLoading],
  );

  useEffect(() => {
    mountedRef.current = true;
    loadSummary();

    const tick = () => {
      if (document.visibilityState === "visible") {
        loadSummary({ silent: true });
      }
    };

    const intervalId = window.setInterval(tick, AUTO_REFRESH_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        loadSummary({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      mountedRef.current = false;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadSummary]);

  const viewCustomer = async (id) => {
    try {
      setLoading(true);
      const data = await fetchCustomerById(URI, id);
      setCustomer(data);
      const payments = await fetchCustomerPayments(URI, id);
      setPaymentList(payments);
      calculateBalance(payments, data);
      setShowCustomer(true);
    } catch {
      setError("Failed to load customer details.");
    } finally {
      setLoading(false);
    }
  };

  const closeCustomer = () => {
    setShowCustomer(false);
    setBalancedAmount(null);
    setCustomer({});
    setPaymentList([]);
  };

  const counts = summary?.counts || {};
  const isInitialLoad = loading && !summary;

  return (
    <div className="w-full min-h-full bg-[#F4F6F8] overflow-y-auto scrollbar-hide">
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-5 pb-10">
        <DashboardHeader
          lastUpdated={summary?.generatedAt}
          loading={loading}
          refreshing={refreshing}
          onRefresh={() => loadSummary({ silent: !!summary })}
          autoRefresh
        />

        {error ? (
          <DashboardError message={error} onRetry={() => loadSummary()} />
        ) : null}

        {isInitialLoad ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-[#EAFBF1] border-t-[#076300] animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Loading live dashboard…</p>
          </div>
        ) : summary ? (
          <div
            className={`space-y-5 transition-opacity duration-200 ${refreshing ? "opacity-90" : "opacity-100"}`}
          >
            <DashboardKpiStrip
              counts={counts}
              funnel={summary.funnel}
              subscriptions={summary.subscriptions}
            />

            <DashboardBusinessOverview counts={counts} />

            <DashboardInsightPanels
              funnel={summary.funnel}
              properties={summary.properties}
              subscriptions={summary.subscriptions}
            />

            <DashboardStatGrid counts={counts} />

            <DashboardRecentSubscriptions rows={summary.recentSubscriptions} />

            <DashboardRecentCustomers
              rows={summary.recentCustomers}
              onView={viewCustomer}
            />
          </div>
        ) : null}
      </div>

      <CustomerDetailDrawer
        open={showCustomer}
        onClose={closeCustomer}
        customer={customer}
        paymentList={paymentList}
        totalPaid={totalPaid}
        balancedAmount={balancedAmount}
        uri={URI}
      />
    </div>
  );
}
