export default function DashboardSummaryCard({ data }) {
  const safeData = data || {};
  const isLoss = String(safeData.netProfitLoss || "").includes("-");

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6 mt-4 md:mt-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800">
          Business Overview
        </h2>
        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full ${
            isLoss
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          ROI: {safeData.roi || "0.00%"}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-violet-50 rounded-lg border p-4">
          <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
          <h3 className="text-lg font-bold text-violet-700">
            {safeData.totalRevenue || "Rs0.00"}
          </h3>
        </div>

        {/* Net Profit / Loss */}
        <div className="bg-gray-50 rounded-lg border p-4">
          <p className="text-xs text-gray-500 mb-1">Net Profit / Loss</p>
          <h3
            className={`text-lg font-bold ${
              isLoss ? "text-red-600" : "text-green-600"
            }`}
          >
            {safeData.netProfitLoss || "Rs0.00"}
          </h3>
        </div>

        {/* Total Deals */}
        <div className="bg-blue-50 rounded-lg border p-4">
          <p className="text-xs text-gray-500 mb-1">Total Deals</p>
          <h3 className="text-lg font-bold text-blue-700">
            {safeData.totalDeals || 0}
          </h3>
        </div>

        {/* Total Expenses */}
        <div className="bg-red-50 rounded-lg border p-4">
          <p className="text-xs text-gray-500 mb-1">Total Expenses</p>
          <h3 className="text-lg font-bold text-red-600">
            {safeData.totalExpenses || "Rs0.00"}
          </h3>
        </div>

        {/* Marketing Spend */}
        <div className="bg-pink-50 rounded-lg border p-4">
          <p className="text-xs text-gray-500 mb-1">Marketing Spend</p>
          <h3 className="text-lg font-bold text-pink-600">
            {safeData.marketingSpend || "Rs0.00"}
          </h3>
        </div>

        {/* Sales Commission */}
        <div className="bg-yellow-50 rounded-lg border p-4">
          <p className="text-xs text-gray-500 mb-1">Sales Commission</p>
          <h3 className="text-lg font-bold text-yellow-600">
            {safeData.salesCommission || "Rs0.00"}
          </h3>
        </div>

      </div>
    </div>
  );
}