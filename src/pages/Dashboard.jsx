import { parse } from "date-fns";
import { useState, useEffect } from "react";
import { FaRupeeSign } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { FaEye } from "react-icons/fa";
import card1 from "../assets/overview/card1.svg";
import card2 from "../assets/overview/card2.svg";
import card3 from "../assets/overview/card3.svg";
import card4 from "../assets/overview/card4.svg";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { IoMdClose } from "react-icons/io";
import propertyPicture from "../assets/propertyPicture.svg";
import FormatPrice from "../components/FormatPrice";

function Dashboard() {
  const { URI, setLoading, showCustomer, setShowCustomer } = useAuth();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({});
  const [customers, setCustomers] = useState([]);
  const [overviewData, setOverviewData] = useState([]);
  const [overviewCountData, setOverviewCountData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentList, setPaymentList] = useState([]);
  const [totalPaid, setTotalPaid] = useState(null);
  const [balancedAmount, setBalancedAmount] = useState(null);

  // click on the card then scroll down
  const scrollToTable = () => {
    const element = document.getElementById("#table");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fetchCountData = async () => {
    try {
      const response = await fetch(`${URI}/admin/dashboard/count`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Count.");
      const data = await response.json();
      console.log(data);
      setOverviewCountData(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
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

  useEffect(() => {
    fetchData();
  }, []);

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
    {
      name: "View",
      cell: (row) => (
        <FaEye
          onClick={() => {
            viewCustomer(row.enquirersid);
          }}
          className="w-5 h-5 text-blue-600 ml-2 cursor-pointer"
        />
      ),
      width: "100px",
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
      name: "Deal Amount",
      selector: (row) => <FormatPrice price={row.dealamount} />,
      minWidth: "150px",
    },
  ];

  useEffect(() => {
    fetchCountData();
  }, []);

  return (
    <div className="overview overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start">
      <div className="overview-card-container gap-2 sm:gap-3 px-4 md:px-0 w-full grid place-items-center grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-5">
        {[
          {
            label: "Total Deal Amount",
            value:
              (Number(overviewCountData?.totalDealAmount) / 10000000).toFixed(
                2
              ) + " cr" || "00",
            icon: card1,
          },
          {
            label: "No. of Deal Done",
            value: overviewCountData?.totalCustomer || "00",
            icon: card2,
            to: "/customers",
          },
          {
            label: "Total Share",
            value:
              (Number(overviewCountData?.totalCommission) / 100000).toFixed(2) +
                " Lac" || "00",
            icon: card1,
          },
          {
            label: "Deal in Sq. Ft.",
            value: overviewCountData?.totalDealInSquareFeet,
            icon: card4,
          },
          {
            label: "Reparv Share",
            value:
              (
                Number(overviewCountData?.totalReparvCommission) / 100000
              ).toFixed(2) + " Lac" || "00",
            icon: card1,
          },
          {
            label: "Sales Share",
            value:
              (
                Number(overviewCountData?.totalSalesCommission) / 100000
              ).toFixed(2) + " Lac" || "00",
            icon: card1,
          },
          {
            label: "Territory Share",
            value:
              (
                Number(overviewCountData?.totalTerritoryCommission) / 100000
              ).toFixed(2) + " Lac" || "00",
            icon: card1,
          },
        ].map((card, index) => (
          <div
            key={index}
            onClick={() => {
              scrollToTable();
            }}
            className="group overview-card w-full max-w-[190px] sm:max-w-[290px] h-[85px] sm:h-[132px] flex flex-col items-center justify-center gap-2 rounded-lg sm:rounded-[16px] p-4 sm:p-6 border-2 hover:border-[#0BB501] bg-white cursor-pointer"
          >
            <div className="upside w-full sm:max-w-[224px] h-[30px] sm:h-[40px] flex items-center justify-between gap-2 sm:gap-3 text-xs sm:text-base font-semibold">
              <p>{card.label}</p>
              <img
                src={card.icon}
                alt=""
                className={`${
                  card.icon ? "block" : "hidden"
                } w-5 sm:w-10 h-5 sm:h-10 bg-[#cbcbcb] group-hover:bg-[#0BB501] rounded-full`}
              />
            </div>
            <div className="downside w-full h-[30px] sm:w-[224px] sm:h-[40px] flex items-center text-xl sm:text-[32px] font-semibold">
              <p className="flex items-center justify-center">
                {[
                  "Total Deal Amount",
                  "Reparv Share",
                  "Total Share",
                  "Sales Share",
                  "Territory Share",
                ].includes(card.label) && <FaRupeeSign />}
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="overview-card-container gap-2 sm:gap-3 px-4 md:px-0 w-full grid place-items-center grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 my-5">
        {[
          {
            label: "No of Enquiry",
            value: overviewCountData?.totalEnquiry || "00",
            //icon: card4,
            to: "/enquirers",
          },
          {
            label: "Properties",
            value: overviewCountData?.totalProperty || "00",
            //icon: card4,
            to: "/properties",
          },
          {
            label: "Builders",
            value: overviewCountData?.totalBuilder || "00",
            // icon: card4,
            to: "/builders",
          },
          {
            label: "Employees",
            value: overviewCountData?.totalEmployee || "00",
            // icon: card4,
            to: "/employees",
          },
          {
            label: "Promoters",
            value: overviewCountData?.totalPromoter || "00",
            // icon: card4,
            to: "/promoters",
          },
          {
            label: "Project Partners",
            value: overviewCountData?.totalProjectPartner || "00",
            // icon: card4,
            to: "/projectpartner",
          },
          {
            label: "Onboarding Partners",
            value: overviewCountData?.totalOnboardingPartner || "00",
            //icon: card4,
            to: "/onboardingpartner",
          },
          {
            label: "Sales Persons",
            value: overviewCountData?.totalSalesPerson || "00",
            //icon: card4,
            to: "/salespersons",
          },
          {
            label: "Territory Partners",
            value: overviewCountData?.totalTerritoryPartner || "00",
            //icon: card4,
            to: "/territorypartner",
          },
          {
            label: "Guest Users",
            value: overviewCountData?.totalGuestUser || "00",
            //icon: card4,
            to: "/guest-users",
          },
          {
            label: "Total Tickets",
            value: overviewCountData?.totalTicket || "00",
            //icon: card4,
            to: "/tickets",
          },
          {
            label: "Total Blogs",
            value: overviewCountData?.totalBlog || "00",
            //icon: card4,
            to: "/blogs",
          },
        ].map((card, index) => (
          <div
            key={index}
            onClick={() => navigate(card.to)}
            className="overview-card w-full max-w-[190px] sm:max-w-[290px] flex flex-col items-center justify-center gap-2 rounded-lg sm:rounded-[16px] p-4 sm:p-6 border-2 hover:border-[#0BB501] bg-white cursor-pointer"
          >
            <div className="upside w-full sm:max-w-[224px] h-[30px] sm:h-[40px] flex items-center justify-between gap-2 sm:gap-3 text-xs sm:text-base font-semibold ">
              <p>{card.label}</p>
              <p className="flex items-center justify-center text-xl">
                {[
                  "Total Deal Amount",
                  "Reparv Share",
                  "Total Share",
                  "Sales Share",
                  "Territory Share",
                ].includes(card.label) && <FaRupeeSign />}
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div
        id="#table"
        className="overview-table w-full h-[70vh] flex flex-col p-4 md:p-6 gap-4 my-[10px] bg-white md:rounded-[24px]"
      >
        <div className="w-full flex items-center justify-between md:justify-end gap-1 sm:gap-3">
          <p className="block md:hidden text-lg font-semibold">Dashboard</p>
        </div>
        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A] border">
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
          {/* <DashboardFilter counts={propertyCounts} /> */}
        </div>
        <h2 className="text-[16px] ml-1 font-semibold">Customer List</h2>
        <div className="overflow-scroll scrollbar-hide">
          <DataTable
            className="scrollbar-hide"
            customStyles={customStyles}
            columns={columns}
            data={filteredData}
            fixedHeader
            fixedHeaderScrollHeight="50vh"
            pagination
            paginationPerPage={10}
            paginationComponentOptions={{
              rowsPerPageText: "Rows per page:",
              rangeSeparatorText: "of",
              selectAllRowsItem: true,
              selectAllRowsItemText: "All",
            }}
          />
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
}

export default Dashboard;
