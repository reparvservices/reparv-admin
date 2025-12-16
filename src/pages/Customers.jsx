import { parse } from "date-fns";
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import { IoMdClose } from "react-icons/io";
import { FiMoreVertical } from "react-icons/fi";
import FilterData from "../components/FilterData";
import DataTable from "react-data-table-component";
import { useAuth } from "../store/auth";
import DownloadCSV from "../components/DownloadCSV";
import Loader from "../components/Loader";
import propertyPicture from "../assets/propertyPicture.svg";
import FormatPrice from "../components/FormatPrice";

const Customers = () => {
  const {
    URI,
    setLoading,
    showCustomer,
    setShowCustomer,
    showCustomerPaymentForm,
    setShowCustomerPaymentForm,
  } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState({});
  const [enquirerId, setEnquirerId] = useState("");
  const [paymentList, setPaymentList] = useState([]);
  const [totalPaid, setTotalPaid] = useState(null);
  const [balancedAmount, setBalancedAmount] = useState(null);
  const [customerPayment, setCustomerPayment] = useState({
    paymentType: "",
    paymentAmount: "",
  });

  //Payment Image Upload
  const [selectedImage, setSelectedImage] = useState(null);

  const singleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const removeSingleImage = () => {
    setSelectedImage(null);
  };

  const calculateBalance = (payments = [], customer) => {
    const tokenAmount = Number(customer.tokenamount) || 0;
    const dealAmount = Number(customer.dealamount) || 0;

    const totalPaid = payments.reduce(
      (sum, payment) => sum + (Number(payment.paymentAmount) || 0),
      tokenAmount
    );

    const balance = dealAmount - totalPaid;
    setTotalPaid(totalPaid);
    setBalancedAmount(balance);
  };

  //Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${URI}/admin/customers`, {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Customers.");
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching :", err);
    } finally {
      setLoading(false);
    }
  };

  const viewCustomer = async (id) => {
    try {
      const response = await fetch(`${URI}/admin/customers/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch Customers.");
      const data = await response.json();
      setCustomer(data);
      await fetchPaymentData(id, data);
      setShowCustomer(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  const fetchPaymentData = async (id, customer) => {
    try {
      const response = await fetch(`${URI}/admin/customers/payment/get/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Payment Data.");
      const data = await response.json();

      calculateBalance(data, customer);
      setPaymentList(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  const addCustomerPayment = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("paymentType", customerPayment.paymentType);
    formData.append("paymentAmount", customerPayment.paymentAmount);
    if (selectedImage) {
      formData.append("paymentImage", selectedImage);
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${URI}/admin/customers/payment/add/${enquirerId}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert("Payment added Successfully!");
        // Clear input fields
        setCustomerPayment({
          paymentType: "",
          paymentAmount: "",
        });
        setSelectedImage(null);
        setShowCustomerPaymentForm(false);
        await viewCustomer(enquirerId);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error adding Payment:", error);
    } finally {
      setLoading(false);
    }
  };

  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  const filteredData = customers.filter((item) => {
    const matchesSearch =
      item.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.paymenttype?.toLowerCase().includes(searchTerm.toLowerCase());

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

    return matchesSearch && matchesDate;
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
        position: "sticky",
        top: 0,
        zIndex: 10,
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
      name: "SN",
      cell: (row, index) => (
        <div className="relative group flex items-center w-full">
          {/* Serial Number Box */}
          <span
            className={`min-w-6 flex items-center justify-center px-2 py-1 bg-[#EAFBF1] text-[#0BB501] rounded-md cursor-pointer `}
          >
            {index + 1}
          </span>
        </div>
      ),
      width: "70px",
    },
    {
      name: "Property",
      cell: (row) => {
        let imageSrc = propertyPicture;

        try {
          const parsed = JSON.parse(row.frontView);
          if (Array.isArray(parsed) && parsed[0]) {
            imageSrc = `${URI}${parsed[0]}`;
          }
        } catch (e) {
          console.warn("Invalid or null frontView:", row.frontView);
        }

        return (
          <div className="w-[130px] h-14 overflow-hidden flex items-center justify-center">
            <img
              src={imageSrc}
              alt="Property"
              onClick={() => {
                window.open(
                  "https://www.reparv.in/property-info/" + row.seoSlug,
                  "_blank"
                );
              }}
              className="w-full h-[100%] object-cover cursor-pointer"
            />
          </div>
        );
      },
      omit: false,
      width: "130px",
    },
    { name: "Date & Time", selector: (row) => row.created_at, width: "200px" },
    {
      name: "Customer",
      selector: (row) => row.customer,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Contact",
      selector: (row) => row.contact,
      minWidth: "150px",
    },
    {
      name: "Payment Type",
      selector: (row) => row.paymenttype,
      minWidth: "150px",
    },
    {
      name: "Deal Amount",
      selector: (row) => <FormatPrice price={row.dealamount} />,
      minWidth: "150px",
    },
    {
      name: "Token Amount",
      selector: (row) => <FormatPrice price={row.tokenamount} />,
      minWidth: "150px",
    },
    {
      name: "",
      cell: (row) => <ActionDropdown row={row} />,
      width: "120px",
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const ActionDropdown = ({ row }) => {
    const [selectedAction, setSelectedAction] = useState("");

    const handleActionSelect = (action, id, seoSlug) => {
      switch (action) {
        case "view":
          viewCustomer(id);
          break;
        case "addPayment":
          setEnquirerId(id);
          setShowCustomerPaymentForm(true);
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
            handleActionSelect(action, row.enquirersid, row.seoSlug);
          }}
        >
          <option value="" disabled>
            Select Action
          </option>
          <option value="view">View</option>
          <option value="addPayment">Add Payment</option>
        </select>
      </div>
    );
  };

  return (
    <div className="customers overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start">
      <div className="customers-table w-full h-[80vh] flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white md:rounded-[24px]">
        <div className="w-full flex items-center justify-between md:justify-end gap-1 sm:gap-3">
          <p className="block md:hidden text-lg font-semibold">Customers</p>
          <div className="flex xl:hidden flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
            <Loader />
            <DownloadCSV data={filteredData} filename={"Customers.csv"} />
          </div>
        </div>
        <div className="searchBarContainer w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full sm:w-1/2 min-w-[150px] max:w-[289px] md:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start md:justify-between bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search Builder"
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
            <div className="hidden xl:flex flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
              <DownloadCSV data={filteredData} filename={"Customers.csv"} />
            </div>
          </div>
        </div>
        <h2 className="text-[16px] font-semibold">Customers List</h2>
        <div className="overflow-scroll scrollbar-hide">
          <DataTable
            className="scrollbar-hide"
            customStyles={customStyles}
            columns={columns}
            data={filteredData}
            fixedHeader
            fixedHeaderScrollHeight="60vh"
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

      {/* Add Customer Payment Form */}
      <div
        className={` ${
          !showCustomerPaymentForm && "hidden"
        } z-[61] overflow-scroll scrollbar-hide flex fixed`}
      >
        <div className="w-[330px] sm:w-[600px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] h-[65vh] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">ADD Payment</h2>
            <IoMdClose
              onClick={() => {
                setShowCustomerPaymentForm(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={addCustomerPayment}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1 lg:grid-cols-1">
              <input
                type="hidden"
                value={enquirerId || ""}
                onChange={(e) => setEnquirerId(e.target.value)}
              />

              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Payment Type
                </label>
                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
                  style={{ backgroundImage: "none" }}
                  value={customerPayment.paymentType}
                  onChange={(e) =>
                    setCustomerPayment({
                      ...customerPayment,
                      paymentType: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Select Payment Type
                  </option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>

              <div className={` w-full `}>
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Payment Amount
                </label>
                <input
                  type="number"
                  required
                  placeholder="Enter Amount"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={customerPayment.paymentAmount}
                  onChange={(e) =>
                    setCustomerPayment({
                      ...customerPayment,
                      paymentAmount: e.target.value,
                    })
                  }
                />
              </div>

              <div className={`w-full`}>
                <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
                  Upload Payment Image
                </label>
                <div className="w-full mt-2">
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={singleImageChange}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer"
                  >
                    <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                      {"Upload Image"}
                    </span>
                    <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                      Browse
                    </div>
                  </label>
                </div>
                <span className="text-red-500 text-xs ml-1">
                  Maximum Image Size 2 MB
                </span>
                {/* Preview Section */}
                {selectedImage && (
                  <div className="relative mt-2">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Uploaded preview"
                      className="w-full max-w-[350px] object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeSingleImage}
                      className="absolute top-3 left-[270px] sm:left-[310px] bg-red-500 text-white text-sm px-2 py-1 rounded-full"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowCustomerPaymentForm(false);
                }}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Add Payment
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>

      {/* Show Customer Info */}
      <div
        className={`${
          showCustomer ? "flex" : "hidden"
        } z-[61] property-form overflow-scroll scrollbar-hide w-[400px] h-[70vh] md:w-[700px] fixed`}
      >
        <div className="w-[330px] sm:w-[600px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Customer Details</h2>
            <IoMdClose
              onClick={() => {
                setShowCustomer(false);
                setBalancedAmount(null);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form>
            <div className="grid gap-6 md:gap-4 grid-cols-1 lg:grid-cols-2">
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Customer Name
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[4px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={customer.customer}
                  readOnly
                />
              </div>

              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Contact
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[4px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={customer.contact}
                  readOnly
                />
              </div>

              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Sales Partner
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[4px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={customer.assign}
                  readOnly
                />
              </div>

              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Sales Commission
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[4px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={customer.salescommission?.toFixed(2) || 0}
                  readOnly
                />
              </div>

              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Territory Partner
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[4px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={
                    customer.territoryName + " - " + customer.territoryContact
                  }
                  readOnly
                />
              </div>

              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Territory Commission
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[4px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={customer.territorycommission?.toFixed(2) || 0}
                  readOnly
                />
              </div>

              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Deal Amount
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[4px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={
                    (Number(customer.dealamount) / 100000)?.toFixed(2) + " Lac"
                  }
                  readOnly
                />
              </div>

              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Balance Amount
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[4px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={(balancedAmount / 100000)?.toFixed(2) + " Lac"}
                  readOnly
                />
              </div>
            </div>

            <div className="w-full ">
              <label className="block mt-3 text-sm leading-4 text-[#00000066] font-medium">
                Remark
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[4px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={customer.remark}
                readOnly
              />
            </div>

            {/* Show Customer Payment List */}
            <div className="w-full ">
              <div className="w-full mt-6 flex items-center justify-between">
                <h2 className="font-semibold">Payment History</h2>
                <div className="font-semibold text-sm sm:text-base text-black">
                  <span>{"Total:"} </span>
                  <FormatPrice price={totalPaid} />
                </div>
              </div>

              <div className="mt-4 grid gap-6 md:gap-4 grid-cols-1 lg:grid-cols-2">
                <div key="tokenAmount" className="w-full">
                  <div className="w-full px-2 py-1 border rounded-lg">
                    <div className="w-full mt-2 flex flex-row gap-3 items-start justify-start ">
                      <img
                        src={URI + customer.paymentimage}
                        alt="Payment_Image"
                        onClick={() => {
                          window.open(URI + customer.paymentimage, "_blank");
                        }}
                        className="w-[120px] max-h-[100px] object-cover cursor-pointer"
                      />

                      <div className="w-full flex flex-col gap-1 items-start justify-center">
                        <div className="w-full text-sm">
                          <label className="block text-xs leading-4 text-[#00000066] font-medium">
                            Payment Type
                          </label>
                          <span>{customer.paymenttype}</span>
                        </div>
                        <div className="w-full text-sm">
                          <label className="block text-xs leading-4 text-[#00000066] font-medium">
                            Token Amount
                          </label>
                          <FormatPrice
                            price={customer.tokenamount}
                          ></FormatPrice>
                        </div>
                      </div>
                    </div>

                    <div className="w-full text-sm mt-2 my-1 border-t">
                      <label className="block text-xs mt-1 leading-4 text-[#00000066] font-medium">
                        Date & Time
                      </label>
                      <span>{customer.created_at}</span>
                    </div>
                  </div>
                </div>
                {paymentList?.map((payment, index) => (
                  <div key={index} className="w-full">
                    <div className="w-full px-2 py-1 border rounded-lg">
                      <div className="w-full mt-2 flex flex-row gap-3 items-start justify-start ">
                        <img
                          src={URI + payment.paymentImage}
                          alt="Payment_Image"
                          onClick={() => {
                            window.open(URI + payment.paymentImage, "_blank");
                          }}
                          className="w-[120px] h-[80px] object-cover cursor-pointer"
                        />

                        <div className="w-full flex flex-col gap-1 items-start justify-center">
                          <div className="w-full text-sm">
                            <label className="block text-xs leading-4 text-[#00000066] font-medium">
                              Payment Type
                            </label>
                            <span>{payment.paymentType}</span>
                          </div>
                          <div className="w-full text-sm">
                            <label className="block text-xs leading-4 text-[#00000066] font-medium">
                              Payment Amount
                            </label>
                            <FormatPrice
                              price={payment.paymentAmount}
                            ></FormatPrice>
                          </div>
                        </div>
                      </div>

                      <div className="w-full text-sm mt-2 my-1 border-t">
                        <label className="block text-xs mt-1 leading-4 text-[#00000066] font-medium">
                          Date & Time
                        </label>
                        <span>{payment.created_at}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Customers;
