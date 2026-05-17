import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FaEye } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import FormatPrice from "../FormatPrice";
import propertyPicture from "../../assets/propertyPicture.svg";
import { getImageURI } from "../../utils/helper";

const tableStyles = {
  rows: {
    style: {
      padding: "6px 0",
      fontSize: "14px",
      fontWeight: 500,
      color: "#111827",
    },
  },
  headCells: {
    style: {
      fontSize: "13px",
      fontWeight: 600,
      backgroundColor: "#F9FAFB",
      color: "#374151",
    },
  },
};

export default function DashboardRecentCustomers({ rows, onView }) {
  const navigate = useNavigate();

  const columns = [
    {
      name: "SN",
      width: "60px",
      cell: (_, index) => (
        <span className="min-w-6 flex items-center justify-center px-2 py-0.5 bg-[#EAFBF1] text-[#076300] rounded-md text-xs font-semibold">
          {index + 1}
        </span>
      ),
    },
    {
      name: "Property",
      width: "100px",
      cell: (row) => {
        let imageSrc = propertyPicture;
        try {
          const parsed = JSON.parse(row.frontView);
          if (Array.isArray(parsed) && parsed[0]) imageSrc = getImageURI(parsed[0]);
        } catch {
          /* default image */
        }
        return (
          <img
            src={imageSrc}
            alt=""
            className="w-[88px] h-12 object-cover rounded-lg cursor-pointer"
            onClick={() => {
              if (row.seoSlug) {
                window.open(`https://www.reparv.in/property-info/${row.seoSlug}`, "_blank");
              }
            }}
          />
        );
      },
    },
    {
      name: "View",
      width: "70px",
      cell: (row) => (
        <FaEye
          className="w-5 h-5 text-blue-600 cursor-pointer ml-1"
          onClick={() => onView(row.enquirersid)}
        />
      ),
    },
    { name: "Date", selector: (row) => row.created_at, width: "190px" },
    { name: "Customer", selector: (row) => row.customer, minWidth: "140px" },
    { name: "Contact", selector: (row) => row.contact, minWidth: "120px" },
    {
      name: "Deal",
      cell: (row) => <FormatPrice price={row.dealamount} />,
      minWidth: "120px",
    },
  ];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Recent customers</h2>
          <p className="text-sm text-gray-500">Latest token-stage deals</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/customers")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#076300] hover:underline"
        >
          View all customers
          <FiArrowRight size={16} />
        </button>
      </div>
      <DataTable
        columns={columns}
        data={rows || []}
        customStyles={tableStyles}
        pagination={false}
        noDataComponent={
          <p className="py-8 text-center text-sm text-gray-500">No token customers yet.</p>
        }
      />
    </section>
  );
}
