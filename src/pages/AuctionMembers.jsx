import React from "react";
import { useState,useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import AddButton from "../components/AddButton";
import FilterData from "../components/FilterData";
import { IoMdClose } from "react-icons/io";
import DataTable  from "react-data-table-component";


const AuctionMembers = () => {
  const { showAuctionForm, setShowAuctionForm, action, URI } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [datas, setDatas] = useState([]);

  // **Fetch Data from API**
  const fetchData = async () => {
    try {
      const response = await fetch(URI+"/admin/auctionmember",{
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch employees.");
      const data = await response.json();
      setDatas(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleMethod = () => {
    console.log("handle Click");
  };

  const filteredData = datas.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.depositAmount.toLowerCase().includes(searchTerm.toLowerCase())
    
  );

  const columns = [
    { name: "SN", selector: (row, index) => index + 1, sortable: true },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Email", selector: (row) => row.uid, sortable: true },
    { name: "Contact", selector: (row) => row.contact,sortable: true },
    { name: "Address", selector: (row) => row.email,sortable: true },
    { name: "Deposit Amount", selector: (row) => row.salary,sortable: true },
    { name: "Status", 
      cell: (row) => (
        <span className={`px-2 py-1 rounded-md ${row.status === "Active" ? "bg-[#EAFBF1] text-[#0BB501]" : "bg-[#FBE9E9] text-[#FF0000]"}`}>
          {row.status}
        </span>
      )},
    { 
      name: "", 
      cell: (row) => 
        <ActionSelect 
          statusAction={() =>status(row.id)}
          editAction={() =>edit(row.id)}  // Dynamic edit route
          deleteAction={() => del(row.id)} // Delete function
        />
    
    }
  ];

  
  
   
  useEffect(() => {
    fetchData();
   
  }, []);


  return (
    <div className={`Auction overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start`}>
      {!showAuctionForm ? 
        <>
          <div className="employee-table w-full h-[80vh]  flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white rounded-[24px]">
          <p className="block md:hidden text-lg font-semibold">Auction Members</p>
            <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
              <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
                <CiSearch />
                <input
                  type="text"
                  placeholder="Search Auction Member"
                  className="search-input w-[250px] h-[36px] text-sm text-black bg-transparent border-none outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="rightTableHead w-full lg:w-[70%] sm:h-[36px] gap-2 flex flex-wrap justify-end items-center">
                <div className="flex flex-wrap items-center justify-end gap-3 px-2">
                  <FilterData />
                  <CustomDateRangePicker />
                </div>
                <AddButton
                  label={"Add "}
                  func={setShowAuctionForm}
                />
              </div>
            </div>
            <h2 className="text-[16px] font-semibold">Auction Member List</h2>
            <div className="overflow-scroll scrollbar-hide">
              <DataTable columns={columns} data={filteredData} pagination />
            </div>
          </div>

       
        </>
        : 
        <div className=" z-[61] auction-form overflow-scroll scrollbar-hide w-[400px] h-[70vh] md:w-[700px] flex fixed">
          <div className="w-[330px] sm:w-[600px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] bg-white py-8 px-3 pb-16 sm:px-6 border border-[#cfcfcf33] rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-semibold">Auction Member</h2>
              <IoMdClose
                onClick={() => {
                  setShowAuctionForm(false);
                }}
                className="w-6 h-6 cursor-pointer"
              />
            </div>
            <form className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Full Name"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Contact
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Contact Number"
                  className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Address"
                  className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Experience
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Experience"
                  className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Occupation
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Occupation"
                  className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Adhar Card Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Adhar Number"
                  className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Adhar Card
                </label>
                <div className="w-full mt-2">
                  <input type="file" required className="hidden" id="rera-documents" />
                  <label
                    htmlFor="rera-documents"
                    className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer"
                  >
                    <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                      Upload Document
                    </span>
                    <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                      Browse
                    </div>
                  </label>
                </div>
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Pan Card Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Pan Number"
                  className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Pan Card
                </label>
                <div className="w-full mt-2">
                  <input type="file" required className="hidden" id="rera-documents" />
                  <label
                    htmlFor="rera-documents"
                    className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer"
                  >
                    <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                      Upload Document
                    </span>
                    <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                      Browse
                    </div>
                  </label>
                </div>
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Extra
                </label>
                <input
                  type="text"
                  placeholder="Extra"
                  className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Extra
                </label>
                <input
                  type="text"
                  placeholder="Extra"
                  className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Extra
                </label>
                <input
                  type="text"
                  placeholder="Extra"
                  className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                onClick={() => {
                  setShowAuctionForm(false);
                }}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={handleMethod}
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                {action}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  );
};

export default AuctionMembers;
