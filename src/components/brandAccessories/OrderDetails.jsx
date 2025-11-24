import React from "react";
import { parse } from "date-fns";
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../../store/auth";
import CustomDateRangePicker from "../CustomDateRangePicker";
import AddButton from "../AddButton";
import FilterData from "../FilterData";
import { IoMdClose } from "react-icons/io";
import DataTable from "react-data-table-component";
import { FiMoreVertical } from "react-icons/fi";
import Loader from "../Loader";
import DownloadCSV from "../DownloadCSV";
import TableFilter from "./tableFilter";
import { RiArrowDropDownLine } from "react-icons/ri";
import OrderFilter from "./OrderFilter";
import FormatPrice from "../FormatPrice";

const OrderDetails = ({ selectedTable, setSelectedTable }) => {
  const {
    URI,
    setLoading,
    showOrder,
    setShowOrder,
    orderFilter,
    setOrderFilter,
    showStatusForm,
    setShowStatusForm,
  } = useAuth();

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [order, setOrder] = useState({});

  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPartner, setSelectedPartner] = useState("Select Partner");

  // **Fetch Data from API**
  const fetchData = async () => {
    try {
      const response = await fetch(
        `${URI}/admin/brand-accessories/product/orders/get/${selectedPartner}`,
        {
          method: "GET",
          credentials: "include", // Ensures cookies are sent
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch Orders.");
      const data = await response.json();
      //console.log(data);
      setOrders(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //fetch data on form
  const viewOrder = async (id) => {
    try {
      const response = await fetch(
        URI + `/admin/brand-accessories/product/order/${id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch order.");
      const data = await response.json();
      console.log(data);
      setOrder(data);
      //setShowOrder(true);
      setSelectedStatus(data?.orderStatus);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  // change status record
  const changeStatus = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        URI + `/admin/brand-accessories/order/status/${orderId}`,
        {
          method: "PUT",
          credentials: "include", //  Ensures cookies are sent
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ selectedStatus }),
        }
      );
      const data = await response.json();
      //console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      setShowStatusForm(false);
      await fetchData();
    } catch (error) {
      console.error("Error changing status :", error);
    }
  };

  //Delete record
  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Order ?")) return;

    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/brand-accessories/order/delete/${id}`,
        {
          method: "DELETE",
          credentials: "include", // Ensures cookies are sent
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Order deleted successfully!");
        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting Order:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPartner]);

  const getOrderCounts = (data) => {
    return data.reduce(
      (acc, item) => {
        if (item.orderStatus === "New") {
          acc.New++;
        } else if (item.orderStatus === "Out For Delivery") {
          acc.OutForDelivery++;
        } else if (item.orderStatus === "Completed") {
          acc.Completed++;
        } else if (item.orderStatus === "Cancelled") {
          acc.Cancelled++;
        }
        return acc;
      },
      { New: 0, OutForDelivery: 0, Completed: 0, Cancelled: 0 }
    );
  };

  const orderCounts = getOrderCounts(orders);

  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  const filteredData = orders?.filter((item) => {
    const matchesSearch =
      item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partnerName?.toLowerCase().includes(searchTerm.toLowerCase());

    let startDate = range[0].startDate;
    let endDate = range[0].endDate;

    if (startDate) startDate = new Date(startDate.setHours(0, 0, 0, 0));
    if (endDate) endDate = new Date(endDate.setHours(23, 59, 59, 999));

    const itemDate = parse(
      item.created_at,
      "dd MMM yyyy | hh:mm a",
      new Date()
    );

    const matchesDate =
      (!startDate && !endDate) ||
      (startDate && endDate && itemDate >= startDate && itemDate <= endDate);

    const matchesOrder = !orderFilter || item.orderStatus === orderFilter;

    return matchesSearch && matchesDate && matchesOrder;
  });

  const customStyles = {
    rows: {
      style: {
        padding: "5px 0px",
        fontSize: "14px",
        fontWeight: 500,
        color: "#111827",
      },
    },
    headCells: {
      style: {
        fontSize: "14px",
        fontWeight: "600",
        backgroundColor: "#F9FAFB",
        backgroundColor: "#00000007",
        color: "#374151",
      },
    },
    cells: {
      style: {
        fontSize: "13px",
        color: "#1F2937",
      },
    },
  };

  const columns = [
    {
      name: "Product Image",
      cell: (row) => {
        let imageSrc =
          URI + row.productImage ||
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c";
        return (
          <div className="w-[110px] h-[62px] overflow-hidden rounded-lg border flex items-center justify-center">
            <img
              src={imageSrc}
              alt="productImage"
              onClick={() => {
                //navigate(`${URI}${row.image}`, "_blank");
              }}
              className="w-full h-[100%] object-cover cursor-pointer"
            />
          </div>
        );
      },
      width: "150px",
    },

    { name: "Date & Time", selector: (row) => row.orderCreatedAt, width: "200px" },
    {
      name: "Order ID",
      cell: (row, index) => (
        <span
          className={`min-w-6 flex items-center justify-center px-2 py-1 rounded-md cursor-pointer ${
            row.orderStatus === "New"
              ? "bg-[#EAFBF1] text-[#0BB501]"
              : row.orderStatus === "Completed"
              ? "bg-[#E9F2FF] text-[#0068FF]"
              : row.orderStatus === "Out For Delivery"
              ? "bg-[#fff8e3] text-[#ffbc21]"
              : row.orderStatus === "Cancelled"
              ? "bg-[#FFEAEA] text-[#ff2323]"
              : "text-[#000000]"
          }`}
        >
          {row.orderId}
        </span>
      ),
      width: "200px",
    },
    {
      name: "Product",
      selector: (row) => row.productName,
      sortable: true,
      minWidth: "150px",
      maxWidth: "200px",
    },
    {
      name: "Size",
      selector: (row) => row.productSize,
      sortable: true,
      minWidth: "100px",
      maxWidth: "150px",
    },
    {
      name: "Quantity",
      selector: (row) => row.orderQuantity + " Units",
      sortable: true,
      minWidth: "150px",
      maxWidth: "180px",
    },
    {
      name:"Bill Amount",
      selector: (row) => <FormatPrice price={parseInt(row.billAmount)} />,
      sortable: true,
      minWidth: "150px",
      maxWidth: "170px",
    },
    {
      name: "Partner",
      cell: (row) => (
        <span className={`px-2 py-1 rounded-md bg-[#EAFBF1] text-[#0BB501]`}>
          <p>{row.partnerName}</p>
          <p>{row.partnerContact}</p>
        </span>
      ),
      omit: false,
      minWidth: "250px",
    },
    {
      name: "State",
      selector: (row) => row.partnerState,
      omit: false,
      minWidth: "150px",
    },
    {
      name: "City",
      selector: (row) => row.partnerCity,
      omit: false,
      minWidth: "150px",
    },
    {
      name: "Action",
      cell: (row) => <ActionDropdown row={row} />,
      width: "120px",
    },
  ];

  const hasPartner = orders.some((row) => !!row.partnerContact);

  const finalColumns = columns.map((col) => {
    if (["Partner", "State", "City"].includes(col.name)) {
      return { ...col, omit: !hasPartner };
    }
    return col;
  });

  const ActionDropdown = ({ row }) => {
    const [selectedAction, setSelectedAction] = useState("");

    const handleActionSelect = (action, id) => {
      switch (action) {
        case "view":
          viewOrder(id);
          setShowOrder(true);
          break;
        case "status":
          viewOrder(id);
          setOrderId(id);
          setShowStatusForm(true);
          break;
        case "delete":
          del(id);
          break;
        default:
          console.log("Invalid action");
      }
    };

    return (
      <div className="relative inline-block w-[120px]">
        <div className="flex items-center justify-between p-2 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
          <span className=" text-[12px]">{selectedAction || "Action"}</span>
          <FiMoreVertical className="text-gray-500" />
        </div>
        <select
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          value={selectedAction}
          onChange={(e) => {
            const action = e.target.value;
            handleActionSelect(action, row.id);
          }}
        >
          <option value="" disabled>
            Select Action
          </option>
          <option value="view">View Order</option>
          <option value="status">Change Status</option>
          <option value="delete">Delete</option>
        </select>
      </div>
    );
  };

  return (
    <div
      className={`overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start`}
    >
      <div className="sales-table w-full h-[80vh] flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white md:rounded-[24px]">
        <div className="w-full flex items-center justify-between gap-1 sm:gap-3">
          <TableFilter
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
          />
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
            <DownloadCSV data={filteredData} filename={"Orders.csv"} />
          </div>
        </div>
        <div className="w-full flex items-center justify-between gap-1 sm:gap-3">
          <div className="w-full sm:min-w-[230px] sm:max-w-[250px] relative inline-block">
            <div className="flex gap-1 sm:gap-2 items-center justify-between bg-white border border-[#00000033] text-sm font-semibold  text-black rounded-lg py-1 px-3 focus:outline-none focus:ring-2 focus:ring-[#076300]">
              <span>{selectedPartner || "Select Partner"}</span>
              <RiArrowDropDownLine className="w-6 h-6 text-[#000000B2]" />
            </div>
            <select
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              value={selectedPartner}
              onChange={(e) => {
                const action = e.target.value;
                setSelectedPartner(action);
              }}
            >
              <option value="Select Partner">Select Partner</option>
              <option value="Promoter">Promoter</option>
              <option value="Sales Partner">Sales Partner</option>
              <option value="Project Partner">Project Partner</option>
              <option value="Onboarding Partner">Onboarding Partner</option>
              <option value="Territory Partner">Territory Partner</option>
            </select>
          </div>
        </div>
        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] border rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search"
              className="search-input w-[250px] h-[36px] text-sm text-black bg-transparent border-none outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="rightTableHead w-full lg:w-[70%] sm:h-[36px] gap-2 flex flex-wrap justify-end items-center">
            <div className="flex flex-wrap items-center justify-end gap-3 px-2">
              <div className="block">
                <CustomDateRangePicker range={range} setRange={setRange} />
              </div>
            </div>
          </div>
        </div>

        <div className="filterContainer w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <OrderFilter counts={orderCounts} />
        </div>
        <h2 className="text-[16px] font-semibold">Order List</h2>
        <div className="overflow-scroll scrollbar-hide">
          <DataTable
            className="scrollbar-hide"
            customStyles={customStyles}
            columns={finalColumns}
            data={filteredData}
            pagination
            paginationPerPage={15}
            paginationComponentOptions={{
              rowsPerPageText: "Rows per page:",
              rangeSeparatorText: "of",
              selectAllRowsItem: true,
              selectAllRowsItemText: "All",
            }}
          />
        </div>
      </div>

      {/* View Product Details */}
      <div
        className={`${
          showOrder ? "flex" : "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[550px] max-h-[80vh] bg-white py-8 pb-10 px-3 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Order Details</h2>

            <IoMdClose
              onClick={() => {
                setShowOrder(false);
                setOrder({});
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          {/* Product Image and Info */}
          <div className="w-full flex gap-4 items-center">
            <div>
              <img
                src={`${URI}${order?.productImage}`}
                alt="Product"
                className="w-[140px] h-[90px] object-cover rounded-md border"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <h2 className="ml-2 text-base font-semibold text-gray-800">
                {order?.productName || "T-shirts"}
              </h2>

              <div className="bg-[#EAFBF1] text-[#0BB501] px-2 py-[2px] text-sm font-semibold rounded">
                Order Id : {order?.orderId}
              </div>

              <span className="px-2 py-[2px] text-xs font-semibold rounded">
                {order?.orderCreatedAt}
              </span>
            </div>
          </div>
          <div className="border mt-3 mb-3"></div>
          <div className="w-full mb-1">
            <p
              className={`font-semibold text-sm px-4 py-1 rounded-xl ${
                order.orderStatus === "New"
                  ? " bg-[#EAFBF1] text-[#0BB501] border-[#C7F3D9] focus:ring-[#0BB501]"
                  : order.orderStatus === "Completed"
                  ? "bg-[#E9F2FF] text-[#0068FF] border-[#BCD8FF] focus:ring-[#0068FF]"
                  : order.orderStatus === "Out For Delivery"
                  ? "bg-[#fff8e3] text-[#ffbc21] border-[#ffecb3] focus:ring-[#ffbc21]"
                  : order.orderStatus === "Cancelled"
                  ? "bg-[#FFEAEA] text-[#ff2323] border-[#FFCCCC] focus:ring-[#ff2323]"
                  : "bg-white text-black border-[#00000033] focus:ring-green-500"
              }`}
            >
              Order Status - {order?.orderStatus}
            </p>
          </div>
          <div className="grid p-2 grid-cols-2 md:grid-cols-3 gap-4 text-sm font-semibold text-gray-900">
            <div>
              <p className="font-semibold text-xs text-gray-500">
                Product Size
              </p>
              <p className="font-semibold ">{order?.productSize}</p>
            </div>
            <div>
              <p className="font-semibold text-xs text-gray-500">
                Order Quantity
              </p>
              <p className="font-semibold ">
                {order?.orderQuantity || 0} Units
              </p>
            </div>
            <div>
              <p className="font-semibold text-xs text-gray-500">Bill Amount</p>
              <p className="font-semibold ">
                <FormatPrice price={parseFloat(order?.billAmount)} />
              </p>
            </div>
          </div>{" "}
          <div className="border mt-2 mb-2"></div>
        </div>
      </div>

      <div
        className={`${
          showStatusForm ? "flex" : "hidden"
        } z-[61] roleForm overflow-scroll scrollbar-hide w-full fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full md:w-[500px] overflow-scroll scrollbar-hide bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Change Order Status</h2>
            <IoMdClose
              onClick={() => {
                setShowStatusForm(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={changeStatus}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1">
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Order Status
                </label>

                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="" disabled>
                    Select Order Status
                  </option>
                  <option value="New">New</option>
                  <option value="Out For Delivery">Out For Delivery</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Update Status
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
