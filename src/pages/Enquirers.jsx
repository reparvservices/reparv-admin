import React from "react";
import { parse } from "date-fns";
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import FilterData from "../components/FilterData";
import DataTable from "react-data-table-component";
import { FiMoreVertical } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { useAuth } from "../store/auth";
import Loader from "../components/Loader";
import { RiArrowDropDownLine } from "react-icons/ri";
import AddButton from "../components/AddButton";
import propertyPicture from "../assets/propertyPicture.svg";
import FormatPrice from "../components/FormatPrice";
import Select from "react-select";
import DownloadCSV from "../components/DownloadCSV";
import EnquiryFilter from "../components/enquiryFilter";

const Enquirers = () => {
  const {
    URI,
    setLoading,
    showAssignSalesForm,
    setShowAssignSalesForm,
    showEnquiryStatusForm,
    setShowEnquiryStatusForm,
    showPropertyInfo,
    setShowPropertyInfo,
    showEnquiry,
    setShowEnquiry,
    showEnquiryForm,
    setShowEnquiryForm,
    showEnquiryUpdateForm,
    setShowEnquiryUpdateForm,
    showEnquirerPropertyForm,
    setShowEnquirerPropertyForm,
    enquiryFilter,
    setEnquiryFilter,
  } = useAuth();

  const [datas, setDatas] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [remarkList, setRemarkList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [enquiryId, setEnquiryId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [file, setFile] = useState(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [property, setProperty] = useState({});
  const [enquiry, setEnquiry] = useState({});
  const [enquiryStatus, setEnquiryStatus] = useState("");
  const [salesPersonList, setSalesPersonList] = useState([]);
  const [salesPersonAssign, setSalesPersonAssign] = useState({
    salespersonid: "",
    salesperson: "",
    salespersoncontact: "",
    state: "",
    city: "",
  });
  const [followUpRemark, setFollowUpRemark] = useState("");
  const [cancelledRemark, setCancelledRemark] = useState("");
  const [visitRemark, setVisitRemark] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [token, setToken] = useState({
    paymenttype: "",
    tokenamount: "",
    dealamount: "",
    remark: "",
  });

  const [selectedSource, setSelectedSource] = useState("Select Enquiry Source");
  //const [selectedEnquiryLister, setSelectedEnquiryLister] = useState("Select Enquiry Lister");

  const [error, setError] = useState("");
  const [properties, setProperties] = useState([]);
  const [propertyList, setPropertyList] = useState([]);

  const [newEnquiry, setNewEnquiry] = useState({
    propertyid: null,
    customer: "",
    contact: "",
    minbudget: "",
    maxbudget: "",
    category: "",
    state: "",
    city: "",
    location: "",
    message: "",
  });

  const enquirersCSVFileFormat = [
    {
      customer: "",
      contact: "",
      minbudget: "",
      maxbudget: "",
      category: "",
      state: "",
      city: "",
      location: "",
      message: "",
    },
  ];

  //Single Image Upload
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

  // **Fetch States from API**
  const fetchStates = async () => {
    try {
      const response = await fetch(URI + "/admin/states", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch States.");
      const data = await response.json();
      setStates(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // **Fetch States from API**
  const fetchCities = async () => {
    try {
      const response = await fetch(
        `${URI}/admin/cities/${newEnquiry?.state || salesPersonAssign?.state}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch cities.");
      const data = await response.json();
      console.log(data);
      setCities(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${URI}/admin/enquirers/get/${selectedSource}`,
        {
          method: "GET",
          credentials: "include", //  Ensures cookies are sent
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch Enquirers.");
      const data = await response.json();
      setDatas(data);
    } catch (err) {
      console.error("Error fetching :", err);
    } finally {
      setLoading(false);
    }
  };

  // **Fetch Data from API**
  const fetchEnquiryRemarkList = async (id) => {
    try {
      const response = await fetch(URI + "/admin/enquirers/remark/list/" + id, {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch enquirers.");
      const list = await response.json();
      setRemarkList(list);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // ** Fetch Properties for Update Enquiry **
  const fetchProperties = async () => {
    try {
      setError(""); // clear previous error
      const response = await fetch(URI + "/admin/enquirers/properties", {
        method: "POST",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          minbudget: newEnquiry.minbudget,
          maxbudget: newEnquiry.maxbudget,
          state: newEnquiry.state,
          city: newEnquiry.city,
          category: newEnquiry.category,
        }),
      });

      // Check if API failed
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to fetch properties.");
      }

      const list = await response.json();

      if (list.data.length === 0) {
        setError("Properties not found based on your requirement.");
        setProperties([]);
      } else {
        setProperties(list.data);
        //console.log(list);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError(
        err.message || "Something went wrong while fetching properties."
      );
      setProperties([]);
    }
  };

  // **Fetch Data from API**
  const fetchPropertyList = async (id) => {
    try {
      const response = await fetch(
        URI + "/admin/enquirers/property/list/" + id,
        {
          method: "GET",
          credentials: "include", // Ensures cookies are sent
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok)
        throw new Error("Failed to fetch enquirers property list.");
      const list = await response.json();
      setPropertyList(list);
      setShowEnquirerPropertyForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  const updatePropertyToEnquiry = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/enquirers/property/update/${enquiryId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ propertyId }),
        }
      );
      const data = await response.json();
      console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      setPropertyId("");
      setShowEnquirerPropertyForm(false);
      fetchData();
    } catch (error) {
      console.error("Error Updating Property to Enquiry :", error);
    } finally {
      setLoading(false);
    }
  };

  //Fetch Sales Persons List
  const fetchSalesPersonList = async () => {
    try {
      const response = await fetch(URI + "/admin/salespersons/active", {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Sales Persons.");
      const data = await response.json();
      setSalesPersonList(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // change status record
  const changeEnquiryStatus = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (enquiryStatus === "Visit Scheduled") {
      if (!visitDate || !visitRemark) {
        return alert("All Fields Are Required!");
      }

      try {
        const response = await fetch(
          `${URI}/admin/enquirers/visitscheduled/${enquiryId}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ visitDate, visitRemark, enquiryStatus }),
          }
        );
        const data = await response.json();
        console.log(response);
        if (response.ok) {
          alert(`Success: ${data.message}`);
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error("Error while Add Visit Scheduled:", error);
      } finally {
        setLoading(false);
      }
    }

    if (enquiryStatus === "Token") {
      if (!token.dealamount || !token.paymenttype || !token.remark) {
        return alert("All Fields Are Required!");
      }
      const formData = new FormData();
      formData.append("paymenttype", token.paymenttype);
      formData.append("tokenamount", token.tokenamount);
      formData.append("remark", token.remark);
      formData.append("dealamount", token.dealamount);
      formData.append("enquiryStatus", enquiryStatus);
      if (selectedImage) {
        formData.append("paymentimage", selectedImage);
      }

      try {
        const response = await fetch(
          `${URI}/admin/enquirers/token/${enquiryId}`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );
        const data = await response.json();
        if (response.ok) {
          alert(`Success: ${data.message}`);
          setToken({
            paymenttype: "",
            tokenamount: "",
            dealamount: "",
            remark: "",
          });
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error("Error while Add Token:", error);
      } finally {
        setLoading(false);
      }
    }

    if (enquiryStatus === "Follow Up") {
      if (!followUpRemark) {
        return alert("All Fields Are Required!");
      }
      try {
        const response = await fetch(
          `${URI}/admin/enquirers/followup/${enquiryId}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ followUpRemark, visitDate, enquiryStatus }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          alert(`Success: ${data.message}`);
          setFollowUpRemark("");
          setVisitDate("");
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error("Error while Add Follow Up Remark:", error);
      } finally {
        setLoading(false);
      }
    }

    if (enquiryStatus === "Cancelled") {
      if (!cancelledRemark) {
        return alert("All Fields Are Required!");
      }
      try {
        const response = await fetch(
          `${URI}/admin/enquirers/cancelled/${enquiryId}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ cancelledRemark, enquiryStatus }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          alert(`Success: ${data.message}`);
          setCancelledRemark("");
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error("Error while Add Cancelled Remark:", error);
      } finally {
        setLoading(false);
      }
    }

    if (
      !window.confirm(
        "Are you sure you want to change into this Enquiry status?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${URI}/admin/enquirers/status/${enquiryId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ enquiryStatus }),
        }
      );
      const data = await response.json();
      console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
        setShowEnquiryStatusForm(false);
        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error changing status:", error);
    } finally {
      setLoading(false);
    }
  };

  const assignSalesPerson = async (e) => {
    e.preventDefault();
    if (
      !window.confirm(
        "Are you sure you want to assign Enquiry to " +
          salesPersonAssign.salesperson
      )
    )
      return;

    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/enquirers/assign/${enquiryId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(salesPersonAssign),
        }
      );
      const data = await response.json();
      console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      setSalesPersonAssign({
        salespersonid: "",
        salesperson: "",
        salespersoncontact: "",
      });
      setShowAssignSalesForm(false);
      fetchData();
    } catch (error) {
      console.error("Error deleting :", error);
    } finally {
      setLoading(false);
    }
  };

  const viewEnquiry = async (id) => {
    try {
      const response = await fetch(URI + `/admin/enquirers/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch enquiry.");
      const data = await response.json();
      setEnquiry(data);
      setShowEnquiry(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  const updateEnquiry = async (e) => {
    e.preventDefault();

    const endpoint = newEnquiry.enquirersid
      ? `update/enquiry/${newEnquiry.enquirersid}`
      : "add/enquiry";
    try {
      setLoading(true);
      const response = await fetch(`${URI}/admin/enquiries/${endpoint}`, {
        method: newEnquiry.enquirersid ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEnquiry),
      });

      if (response.status === 409) {
        alert("Enquiry already exists!");
      } else if (!response.ok) {
        throw new Error(`Failed to save enquiry. Status: ${response.status}`);
      } else {
        alert(
          newEnquiry.enquirersid
            ? "Enquiry updated successfully!"
            : "Enquiry added successfully!"
        );
      }

      // Clear form only after successful fetch
      setNewEnquiry({
        propertyid: null,
        customer: "",
        contact: "",
        minbudget: "",
        maxbudget: "",
        category: "",
        state: "",
        city: "",
        location: "",
        message: "",
      });

      setShowEnquiryUpdateForm(false);

      await fetchData();
    } catch (err) {
      console.error("Error saving enquiry:", err);
    } finally {
      setLoading(false);
    }
  };

  //fetch data on form
  const edit = async (id) => {
    try {
      const response = await fetch(`${URI}/sales/enquirers/${id}`, {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch ticket.");
      const data = await response.json();
      setNewEnquiry(data);
      setShowEnquiryUpdateForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // Add Additional Info as a CSV File
  const addCsv = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a CSV file.");

    const formData = new FormData();
    formData.append("csv", file);

    try {
      const response = await fetch(`${URI}/admin/enquiries/csv/add`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      fetchData();
      setShowEnquiryForm(false);
      if (!response.ok) throw new Error(data.message || "Upload failed");

      alert(data.message);
    } catch (error) {
      console.error(error);
      alert("Upload failed!");
    }
  };

  // Delete Enquiry
  const deleteEnquiry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Enquiry ?"))
      return;
    try {
      setLoading(true);
      const response = await fetch(URI + `/admin/enquirers/delete/${id}`, {
        method: "DELETE",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        alert("Enquiry deleted successfully!");
        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting Enquiry:", error);
    } finally {
      setLoading(false);
    }
  };

  const customStyle = {
    menu: (provided) => ({
      ...provided,
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: "200px", // Default is ~160px — increase as needed
      paddingTop: 0,
      paddingBottom: 0,
    }),
  };

  useEffect(() => {
    fetchData();
  }, [selectedSource]);

  useEffect(() => {
    fetchData();
    fetchStates();
    fetchSalesPersonList();
  }, []);

  useEffect(() => {
    if (
      newEnquiry.minbudget != "" &&
      newEnquiry.maxbudget != "" &&
      newEnquiry.category != "" &&
      newEnquiry.state != "" &&
      newEnquiry.city != ""
    ) {
      fetchProperties();
    }
  }, [
    newEnquiry.minbudget,
    newEnquiry.maxbudget,
    newEnquiry.category,
    newEnquiry.state,
    newEnquiry.city,
  ]);

  useEffect(() => {
    if (newEnquiry.state != "" || salesPersonAssign.state != "") {
      fetchCities();
    }
  }, [newEnquiry.state, salesPersonAssign.state]);

  const getEnquiryCounts = (data) => {
    return data.reduce(
      (acc, item) => {
        if (!item.salespersonid && !item.territorypartnerid) {
          acc.New++;
        } else if (item.salespersonid && !item.territorypartnerid) {
          acc.Alloted++;
        } else if (item.salespersonid && item.territorypartnerid) {
          acc.Assign++;
        }
        return acc;
      },
      { New: 0, Alloted: 0, Assign: 0 }
    );
  };

  const enquiryCounts = getEnquiryCounts(datas);

  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  const filteredData = datas.filter((item) => {
    // Enquiry Lister
    {
      /*const getEnquiryLister = () => {
      if (!item.salespersonid && !item.territorypartnerid && !item.propertyid)
        return "Admin";
      if (!item.salespersonid && !item.territorypartnerid && item.propertyid)
        return "Customer";
      if (item.salespersonid) return "Sales Partner";
      if (item.territorypartnerid) return "Territory Partner";
      return "";
    };

    const matchesEnquiryLister =
      !selectedEnquiryLister || getEnquiryLister() === selectedEnquiryLister;
    */
    }

    // Status filter
    const matchesStatus = item.status
      ?.toLowerCase()
      .includes(selectedFilter.toLowerCase());

    // Search term filter
    const matchesSearch =
      item.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assign?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.territoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source?.toLowerCase().includes(searchTerm.toLowerCase());

    // Date range filter
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

    // Enquiry filter logic: New, Alloted, Assign
    const getEnquiryStatus = () => {
      if (!item.salespersonid && !item.territorypartnerid) return "New";
      if (item.salespersonid && !item.territorypartnerid) return "Alloted";
      if (item.salespersonid && item.territorypartnerid) return "Assign";
      return "";
    };

    const matchesEnquiry =
      !enquiryFilter || getEnquiryStatus() === enquiryFilter;

    return matchesStatus && matchesSearch && matchesDate && matchesEnquiry;
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
      name: "SN",
      cell: (row, index) => (
        <span
          className={`min-w-6 flex items-center justify-center px-2 py-1 rounded-md ${
            row.status === "New"
              ? "bg-[#EAFBF1] text-[#0BB501]"
              : row.status === "Visit Scheduled"
              ? "bg-[#E9F2FF] text-[#0068FF]"
              : row.status === "Token"
              ? "bg-[#FFF8DD] text-[#FFCA00]"
              : row.status === "Cancelled"
              ? "bg-[#FFEAEA] text-[#ff2323]"
              : row.status === "Follow Up"
              ? "bg-[#F4F0FB] text-[#5D00FF]"
              : "text-[#000000]"
          }`}
        >
          {index + 1}
        </span>
      ),
      width: "70px",
    },

    {
      name: "Status",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-md ${
            row.status === "New"
              ? "bg-[#EAFBF1] text-[#0BB501]"
              : row.status === "Visit Scheduled"
              ? "bg-[#E9F2FF] text-[#0068FF]"
              : row.status === "Token"
              ? "bg-[#FFF8DD] text-[#FFCA00]"
              : row.status === "Cancelled"
              ? "bg-[#FFEAEA] text-[#ff2323]"
              : row.status === "Follow Up"
              ? "bg-[#F4F0FB] text-[#5D00FF]"
              : "text-[#000000]"
          }`}
        >
          {row.status}
        </span>
      ),
      minWidth: "150px",
    },

    {
      name: "Intrested Property",
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
      name: "Source",
      selector: (row) => row.source,
      width: "150px",
    },
    {
      name: "Enquiry Lister",
      cell: (row) => (
        <div className="w-full flex flex-col gap-[2px]">
          <p>{row.listerRole}</p>
          <p>{row.listerName}</p>
          <p>{row.listerContact}</p>
        </div>
      ),
      omit: false,
      minWidth: "180px",
    },
    {
      name: "Project Partner",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-md ${
            row.projectpartnerid
              ? "bg-[#EAFBF1] text-[#0BB501]"
              : "bg-[#FFEAEA] text-[#ff2323]"
          }`}
        >
          {(row.projectPartnerName ? row.projectPartnerName + " - " : "No ") +
            (row.projectPartnerContact ? row.projectPartnerContact : "Assign")}
        </span>
      ),
      minWidth: "180px",
    },
    {
      name: "Sales Partner",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-md ${
            row.assign === "No Assign"
              ? "bg-[#FFEAEA] text-[#ff2323]"
              : "bg-[#EAFBF1] text-[#0BB501]"
          }`}
        >
          {row.assign}
        </span>
      ),
      minWidth: "180px",
    },
    {
      name: "Territory Partner",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-md ${
            row.territorystatus === "Accepted"
              ? "bg-[#EAFBF1] text-[#0BB501]"
              : "bg-[#FFEAEA] text-[#ff2323]"
          }`}
        >
          {(row.territoryName ? row.territoryName + " - " : "No ") +
            (row.territoryContact ? row.territoryContact : "Assign")}
        </span>
      ),
      minWidth: "180px",
    },
    {
      name: "Action",
      cell: (row) => <ActionDropdown row={row} />,
      width: "120px",
    },
  ];

  const hasEnquiryLister = datas.some((row) => !!row.listerName);

  const finalColumns = columns.map((col) => {
    if (col.name === "Enquiry Lister")
      return { ...col, omit: !hasEnquiryLister };
    return col;
  });

  const ActionDropdown = ({ row }) => {
    const [selectedAction, setSelectedAction] = useState("");

    const handleActionSelect = (action, id) => {
      switch (action) {
        case "view":
          viewEnquiry(id);
          fetchEnquiryRemarkList(id);
          break;
        case "status":
          setEnquiryId(id);
          setShowEnquiryStatusForm(true);
          break;
        case "property":
          setEnquiryId(id);
          fetchPropertyList(id);
          break;
        case "assign":
          setEnquiryId(id);
          setShowAssignSalesForm(true);
          break;
        case "update":
          edit(id);
          break;
        case "delete":
          deleteEnquiry(id);
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
            handleActionSelect(action, row.enquirersid);
          }}
        >
          <option value="" disabled>
            Change Status
          </option>
          <option value="view">View</option>
          <option value="status">Status</option>
          {row.source !== "Onsite" && <option value="update">Update</option>}
          <option value="delete">Delete</option>
        </select>
      </div>
    );
  };

  return (
    <div className="enquirers overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start">
      <div className="enquirers-table w-full h-[80vh] flex flex-col p-4 md:p-6 gap-3 my-[10px] bg-white md:rounded-[24px]">
        {/* <p className="block md:hidden text-lg font-semibold">Enquirers</p> */}

        <div className="w-full flex items-center justify-between gap-1 sm:gap-3">
          <div className="w-[65%] sm:min-w-[220px] sm:max-w-[230px] relative inline-block">
            <div className="flex gap-1 sm:gap-2 items-center justify-between bg-white border border-[#00000033] text-sm font-semibold  text-black rounded-lg py-1 px-3 focus:outline-none focus:ring-2 focus:ring-[#076300]">
              <span>{selectedSource || "Select Source"}</span>
              <RiArrowDropDownLine className="w-6 h-6 text-[#000000B2]" />
            </div>
            <select
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              value={selectedSource}
              onChange={(e) => {
                const action = e.target.value;
                setSelectedSource(action);
              }}
            >
              <option value="Select Enquiry Source">
                Select Enquiry Source
              </option>
              <option value="Onsite">Onsite</option>
              <option value="Direct">Direct</option>
              <option value="CSV">CSV File</option>
              <option value="Landing Page">Landing Page</option>
            </select>
          </div>

          <div className="flex xl:hidden flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
            <DownloadCSV data={filteredData} filename={"Enquirers.csv"} />
            <AddButton label={"Add "} func={setShowEnquiryForm} />
          </div>
        </div>

        {/*}
        <div className="w-full sm:min-w-[220px] sm:max-w-[230px] relative inline-block">
          <div className="flex gap-1 sm:gap-2 items-center justify-between bg-white border border-[#00000033] text-sm font-semibold  text-black rounded-lg py-1 px-3 focus:outline-none focus:ring-2 focus:ring-[#076300]">
            <span>{selectedEnquiryLister || "Select Enquiry Lister"}</span>
            <RiArrowDropDownLine className="w-6 h-6 text-[#000000B2]" />
          </div>
          <select
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            value={selectedEnquiryLister}
            onChange={(e) => {
              const action = e.target.value;
              setSelectedEnquiryLister(action);
            }}
          >
            <option value="Select Enquiry Lister">Select Enquiry Lister</option>
            <option value="Admin">Admin</option>
            <option value="Customer">Customer</option>
            <option value="Sales Partner">Sales Partner</option>
            <option value="Territory Partner">Territory Partner</option>
          </select>
        </div>
        */}

        <div className="searchBarContainer w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search Enquiry"
              className="search-input w-[250px] h-[36px] text-sm text-black bg-transparent border-none outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="rightTableHead w-full lg:w-[70%] sm:h-[36px] gap-2 flex flex-wrap justify-end items-center">
            <div className="flex items-center justify-end gap-3 px-2">
              <FilterData
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
              />
              <div className="block">
                <CustomDateRangePicker range={range} setRange={setRange} />
              </div>
            </div>
            <div className="hidden xl:flex flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
              <DownloadCSV data={filteredData} filename={"Enquirers.csv"} />
              <AddButton label={"Add "} func={setShowEnquiryForm} />
            </div>
          </div>
        </div>
        <div className="filterContainer w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <EnquiryFilter counts={enquiryCounts} />
        </div>
        <h2 className="text-[16px] font-semibold">Enquiry List</h2>
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

      <div
        className={`${
          showEnquiryForm ? "flex" : "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-[400px] min-h-[250px] max:h-[75vh] md:w-[450px] fixed`}
      >
        <div className="w-[350px] sm:w-[600px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Add Enquiries</h2>
            <IoMdClose
              onClick={() => {
                setShowEnquiryForm(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={addCsv}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1">
              <div className="w-full mt-2">
                <input
                  type="file"
                  required
                  accept=".csv"
                  multiple
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="csvFile"
                />
                <label
                  htmlFor="csvFile"
                  className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer"
                >
                  <span className="m-3 overflow-hidden p-2 text-[16px] font-medium text-[#00000066]">
                    {file ? file.name : "Upload File"}
                  </span>
                  <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                    Browse
                  </div>
                </label>
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-center gap-6">
              <DownloadCSV
                data={enquirersCSVFileFormat}
                filename={"Enquirers_File_Format.csv"}
              />
              <button
                type="submit"
                className="px-4 py-2 text-white font-semibold bg-[#076300] rounded active:scale-[0.98]"
              >
                Add CSV File
              </button>
              <Loader />
            </div>
          </form>
        </div>
      </div>

      {/* Update Enquiry Form */}
      <div
        className={` ${
          !showEnquiryUpdateForm && "hidden"
        }  z-[61] overflow-scroll scrollbar-hide h-[75vh] flex fixed`}
      >
        <div className="w-[330px] sm:w-[600px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] bg-white py-8 pb-10 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Enquiry Details</h2>
            <IoMdClose
              onClick={() => {
                setShowEnquiryUpdateForm(false);
                setNewEnquiry({
                  propertyid: null,
                  customer: "",
                  contact: "",
                  minbudget: "",
                  maxbudget: "",
                  category: "",
                  state: "",
                  city: "",
                  location: "",
                  message: "",
                });
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={updateEnquiry}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1 lg:grid-cols-2">
              <input
                type="hidden"
                value={newEnquiry.enquirersid || ""}
                onChange={(e) => {
                  setPartnerId(e.target.value);
                }}
              />
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Full Name"
                  value={newEnquiry.customer}
                  onChange={(e) => {
                    setNewEnquiry({
                      ...newEnquiry,
                      customer: e.target.value,
                    });
                  }}
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Contact Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Contact Number"
                  value={newEnquiry.contact}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^\d{0,10}$/.test(input)) {
                      // Allows only up to 10 digits
                      setNewEnquiry({
                        ...newEnquiry,
                        contact: e.target.value,
                      });
                    }
                  }}
                  className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Min-Budget <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="Enter Your Budget"
                  value={newEnquiry.minbudget}
                  onChange={(e) => {
                    setNewEnquiry({
                      ...newEnquiry,
                      minbudget: e.target.value,
                    });
                  }}
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Max-Budget <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="Enter Your Budget"
                  value={newEnquiry.maxbudget}
                  onChange={(e) => {
                    setNewEnquiry({
                      ...newEnquiry,
                      maxbudget: e.target.value,
                    });
                  }}
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Property Category <span className="text-red-600">*</span>
                </label>
                <select
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
                  style={{ backgroundImage: "none" }}
                  value={newEnquiry.category}
                  onChange={(e) =>
                    setNewEnquiry({
                      ...newEnquiry,
                      category: e.target.value,
                    })
                  }
                >
                  <option value="">Select Property Category</option>
                  <option value="NewFlat">New Flat</option>
                  <option value="NewPlot">New Plot</option>
                  <option value="RentalFlat">Rental Flat</option>
                  <option value="RentalShop">Rental Shop</option>
                  <option value="RentalOffice">Rental Office</option>
                  <option value="Resale">Resale</option>
                  <option value="RowHouse">Row House</option>
                  <option value="Lease">Lease</option>
                  <option value="FarmLand">Farm Land</option>
                  <option value="FarmHouse">Farm House</option>
                  <option value="CommercialFlat">Commercial Flat</option>
                  <option value="CommercialPlot">Commercial Plot</option>
                  <option value="IndustrialSpace">Industrial Space</option>
                </select>
              </div>

              {/* State Select Input */}
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Select State <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
                  style={{ backgroundImage: "none" }}
                  value={newEnquiry.state}
                  onChange={(e) =>
                    setNewEnquiry({
                      ...newEnquiry,
                      state: e.target.value,
                    })
                  }
                >
                  <option value="">Select Your State</option>
                  {states?.map((state, index) => (
                    <option key={index} value={state.state}>
                      {state.state}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Select Input */}
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Select City <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
                  style={{ backgroundImage: "none" }}
                  value={newEnquiry.city}
                  onChange={(e) =>
                    setNewEnquiry({
                      ...newEnquiry,
                      city: e.target.value,
                    })
                  }
                >
                  <option value="">Select Your City</option>
                  {cities?.map((city, index) => (
                    <option key={index} value={city.city}>
                      {city.city}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Location <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Location"
                  value={newEnquiry.location}
                  onChange={(e) => {
                    setNewEnquiry({
                      ...newEnquiry,
                      location: e.target.value,
                    });
                  }}
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full col-span-2">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  {error === "" ? "Select Property" : error}
                </label>

                <select
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
                  style={{ backgroundImage: "none" }}
                  value={newEnquiry.propertyid}
                  onChange={(e) => {
                    const selectedValue =
                      e.target.value === "" ? null : e.target.value;
                    setNewEnquiry({
                      ...newEnquiry,
                      propertyid: selectedValue,
                    });
                  }}
                >
                  <option value="">Select Property</option>
                  {properties.length > 0 &&
                    properties?.map((property, index) => (
                      <option key={index} value={property.propertyid}>
                        {property.propertyName} | {property.builtUpArea} sqft |{" "}
                        <FormatPrice price={property.totalOfferPrice} />
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3  mt-[10px] text-sm text-[#00000066] font-medium ">
              <label htmlFor="message" className="ml-1">
                Message <span className="text-red-600">*</span>
              </label>
              <textarea
                name="message"
                id="message"
                placeholder="Enter your Message here.."
                value={newEnquiry.message}
                onChange={(e) => {
                  setNewEnquiry({
                    ...newEnquiry,
                    message: e.target.value,
                  });
                }}
                className="w-full text-black text-base font-medium p-4 border border-[#00000033] rounded-md focus:outline-0"
                rows="2"
              ></textarea>
            </div>

            <div className="flex h-10 mt-8 md:mt-6 justify-center sm:justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowEnquiryUpdateForm(false);
                  setNewEnquiry({
                    propertyid: null,
                    customer: "",
                    contact: "",
                    minbudget: "",
                    maxbudget: "",
                    category: "",
                    state: "",
                    city: "",
                    location: "",
                    message: "",
                  });
                }}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Save Enquiry
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>

      {/* Assign To Sales Person */}
      <div
        className={` ${
          !showAssignSalesForm && "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto`}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] h-[70vh] bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">
              Assign Enquiry to Sales Person
            </h2>
            <IoMdClose
              onClick={() => {
                setShowAssignSalesForm(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={assignSalesPerson}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1">
              <input
                type="hidden"
                value={enquiryId}
                onChange={(e) => {
                  setEnquiryId(e.target.value);
                }}
              />

              {/* State */}
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium mb-[10px]">
                  Select State
                </label>
                <Select
                  className="text-[16px] font-medium"
                  options={
                    states?.map((state) => ({
                      value: state.state,
                      label: state.state,
                    })) || []
                  }
                  placeholder="Select Your State"
                  value={
                    states
                      ?.map((state) => ({
                        value: state.state,
                        label: state.state,
                      }))
                      .find((opt) => opt.value === salesPersonAssign.state) ||
                    null
                  }
                  onChange={(selected) =>
                    setSalesPersonAssign({
                      ...salesPersonAssign,
                      state: selected?.value || "",
                    })
                  }
                />
              </div>

              {/* City */}
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium mb-[10px]">
                  Select City
                </label>
                <Select
                  className="text-[16px] font-medium"
                  options={
                    cities?.map((city) => ({
                      value: city.city,
                      label: city.city,
                    })) || []
                  }
                  placeholder="Select Your City"
                  value={
                    cities
                      ?.map((city) => ({
                        value: city.city,
                        label: city.city,
                      }))
                      .find((opt) => opt.value === salesPersonAssign.city) ||
                    null
                  }
                  onChange={(selected) =>
                    setSalesPersonAssign({
                      ...salesPersonAssign,
                      city: selected?.value || "",
                    })
                  }
                />
              </div>

              {/* Sales Person */}
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium mb-[10px]">
                  Select Sales Person <span className="text-red-600">*</span>
                </label>
                <Select
                  required
                  styles={customStyle}
                  className="text-[16px] font-medium"
                  options={
                    salesPersonList
                      ?.filter(
                        (sp) =>
                          sp.status === "Active" &&
                          (!salesPersonAssign.state ||
                            sp.state === salesPersonAssign.state) &&
                          (!salesPersonAssign.city ||
                            sp.city === salesPersonAssign.city)
                      )
                      .map((sp) => ({
                        value: {
                          salespersonid: sp.salespersonsid,
                          salesperson: sp.fullname,
                          salespersoncontact: sp.contact,
                        },
                        label: `${sp.fullname} | ${sp.contact}`,
                      })) || []
                  }
                  placeholder="Select Sales Person"
                  value={
                    salesPersonAssign
                      ? salesPersonList
                          ?.filter((sp) => sp.status === "Active")
                          .map((sp) => ({
                            value: {
                              salespersonid: sp.salespersonsid,
                              salesperson: sp.fullname,
                              salespersoncontact: sp.contact,
                            },
                            label: `${sp.fullname} | ${sp.contact}`,
                          }))
                          .find(
                            (opt) =>
                              opt.value.salespersonid ===
                              salesPersonAssign.salespersonid
                          ) || null
                      : null
                  }
                  onChange={(selected) =>
                    setSalesPersonAssign(selected?.value || null)
                  }
                />
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowAssignSalesForm(false);
                }}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Assign Sales
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>

      {/* Change Enquiry Status Form */}
      <div
        className={` ${
          !showEnquiryStatusForm && "hidden"
        } z-[61] overflow-scroll scrollbar-hide flex fixed`}
      >
        <div className="w-[330px] h-[350px] sm:w-[600px] sm:h-[300px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] lg:h-[300px] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Change Enquiry Status</h2>
            <IoMdClose
              onClick={() => {
                setShowEnquiryStatusForm(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form>
            <div className="w-full grid gap-4 place-items-center grid-cols-1 lg:grid-cols-2">
              <input
                type="hidden"
                value={enquiryId || ""}
                onChange={(e) => setEnquiryId(e.target.value)}
              />

              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Enquiry Status
                </label>
                <select
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
                  style={{ backgroundImage: "none" }}
                  value={enquiryStatus}
                  onChange={(e) => {
                    setEnquiryStatus(e.target.value);
                  }}
                >
                  <option value="" disabled>
                    Select Enquiry Status
                  </option>
                  <option value="New">New</option>
                  <option value="Visit Scheduled">Visit Scheduled</option>
                  <option value="Token">Token</option>
                  <option value="Follow Up">Follow Up</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div
                className={`${
                  enquiryStatus === "Visit Scheduled" ? "block" : "hidden"
                } w-full `}
              >
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Meeting Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={visitDate}
                  onChange={(e) => {
                    const selectedDate = e.target.value; // Get full date
                    const formattedDate = selectedDate.split("T")[0]; // Extract only YYYY-MM-DD
                    setVisitDate(formattedDate);
                  }}
                />
              </div>
              <div
                className={`${
                  enquiryStatus === "Visit Scheduled" ? "block" : "hidden"
                } w-full `}
              >
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Enquiry Remark
                </label>
                <textarea
                  rows={2}
                  cols={40}
                  placeholder="Enter Remark"
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={visitRemark}
                  onChange={(e) => {
                    setVisitRemark(e.target.value);
                  }}
                />
              </div>
              <div
                className={`${
                  enquiryStatus === "Token" ? "block" : "hidden"
                } w-full `}
              >
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Payment Type
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Paymet Type"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={token.paymenttype}
                  onChange={(e) =>
                    setToken({ ...token, paymenttype: e.target.value })
                  }
                />
              </div>
              <div
                className={`${
                  enquiryStatus === "Token" ? "block" : "hidden"
                } w-full `}
              >
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Token Amount
                </label>
                <input
                  type="number"
                  required
                  placeholder="Enter Amount"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={token.tokenamount}
                  onChange={(e) =>
                    setToken({ ...token, tokenamount: e.target.value })
                  }
                />
              </div>

              <div
                className={`${
                  enquiryStatus === "Token" ? "block" : "hidden"
                } w-full `}
              >
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Deal In Amount
                </label>
                <input
                  type="number"
                  required
                  placeholder="Enter Amount"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={token.dealamount}
                  onChange={(e) =>
                    setToken({ ...token, dealamount: e.target.value })
                  }
                />
              </div>

              <div
                className={`${
                  enquiryStatus === "Token" ? "block" : "hidden"
                } w-full `}
              >
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Enquiry Remark
                </label>
                <textarea
                  rows={2}
                  cols={40}
                  placeholder="Enter Remark"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={token.remark}
                  onChange={(e) => {
                    setToken({ ...token, remark: e.target.value });
                  }}
                />
              </div>

              <div
                className={`${
                  enquiryStatus === "Token" ? "block" : "hidden"
                } w-full`}
              >
                <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
                  Upload Payment ScreenShot
                </label>
                <div className="w-full mt-2">
                  <input
                    type="file"
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
                      Upload Image
                    </span>
                    <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                      Browse
                    </div>
                  </label>
                </div>

                {/* Preview Section */}
                {selectedImage && (
                  <div className="relative mt-2">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Uploaded preview"
                      className="w-full object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeSingleImage}
                      className="absolute top-1 right-1 bg-red-500 text-white text-sm px-2 py-1 rounded-full"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div
                className={`${
                  enquiryStatus === "Follow Up" ? "block" : "hidden"
                } w-full `}
              >
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Visit Date
                </label>
                <input
                  type="date"
                  placeholder="Enter Visit Date"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={visitDate}
                  onChange={(e) => {
                    const selectedDate = e.target.value; // Get full date
                    const formattedDate = selectedDate.split("T")[0]; // Extract only YYYY-MM-DD
                    setVisitDate(selectedDate === "" ? null : formattedDate);
                  }}
                />
              </div>

              <div
                className={`${
                  enquiryStatus === "Follow Up" ? "block" : "hidden"
                } w-full col-span-2`}
              >
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Enquiry Remark
                </label>
                <textarea
                  rows={2}
                  cols={40}
                  placeholder="Enter Remark"
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={followUpRemark}
                  onChange={(e) => {
                    setFollowUpRemark(e.target.value);
                  }}
                />
              </div>
              <div
                className={`${
                  enquiryStatus === "Cancelled" ? "block" : "hidden"
                } w-full col-span-2`}
              >
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Enquiry Remark
                </label>
                <textarea
                  rows={2}
                  cols={40}
                  placeholder="Enter Remark"
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={cancelledRemark}
                  onChange={(e) => {
                    setCancelledRemark(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowEnquiryStatusForm(false);
                }}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={changeEnquiryStatus}
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Set Status
              </button>
              <Loader />
            </div>
          </form>
        </div>
      </div>

      {/* ADD Property in Enquiry */}
      <div
        className={` ${
          !showEnquirerPropertyForm && "hidden"
        } z-[61] overflow-scroll scrollbar-hide flex fixed`}
      >
        <div className="w-[330px] h-[350px] sm:w-[600px] sm:h-[300px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] lg:h-[300px] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">
              Update Property to Enquiry
            </h2>
            <IoMdClose
              onClick={() => {
                setShowEnquirerPropertyForm(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={updatePropertyToEnquiry}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1">
              <input
                type="hidden"
                value={enquiryId}
                onChange={(e) => {
                  setEnquiryId(e.target.value);
                }}
              />

              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Select Property
                </label>
                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
                  style={{ backgroundImage: "none" }}
                  value={propertyId}
                  onChange={(e) => {
                    setPropertyId(e.target.value);
                  }}
                >
                  <option value="">Select Property</option>
                  {propertyList?.map((property, index) => {
                    return (
                      <option key={index} value={property.propertyid}>
                        {property.propertyName} | {property.builtUpArea}
                        {" sqft"} |{" "}
                        <FormatPrice price={property.totalOfferPrice} />
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowEnquirerPropertyForm(false);
                }}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Update Property
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>

      {/* Show Enquiry Info */}
      <div
        className={`${
          showEnquiry ? "flex" : "hidden"
        } z-[61] property-form overflow-scroll scrollbar-hide w-[400px] h-[70vh] md:w-[700px] fixed`}
      >
        <div className="w-[330px] sm:w-[600px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Enquiry Details</h2>
            <IoMdClose
              onClick={() => {
                setShowEnquiry(false);
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
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={enquiry.customer}
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
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={enquiry.contact}
                  readOnly
                />
              </div>
              <div
                className={`${enquiry.minbudget ? "block" : "hidden"} w-full `}
              >
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Min-Budget
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={enquiry.minbudget}
                  readOnly
                />
              </div>
              <div
                className={`${enquiry.maxbudget ? "block" : "hidden"} w-full `}
              >
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Max-Budget
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={enquiry.maxbudget}
                  readOnly
                />
              </div>
              <div
                className={`${enquiry.category ? "block" : "hidden"} w-full `}
              >
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Property Category
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={enquiry.category}
                  readOnly
                />
              </div>
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  State
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={enquiry.state}
                  readOnly
                />
              </div>
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  City
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={enquiry.city}
                  readOnly
                />
              </div>
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Location
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={enquiry.location}
                  readOnly
                />
              </div>
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Status
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={enquiry.status}
                  readOnly
                />
              </div>
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Project Partner
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={
                    (enquiry.projectPartnerName
                      ? enquiry.projectPartnerName + " - "
                      : "No ") +
                    (enquiry.projectPartnerContact
                      ? enquiry.projectPartnerContact
                      : "Assign")
                  }
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
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={enquiry.assign}
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
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={
                    (enquiry.territoryName
                      ? enquiry.territoryName + " - "
                      : "No ") +
                    (enquiry.territoryContact
                      ? enquiry.territoryContact
                      : "Assign")
                  }
                  readOnly
                />
              </div>
            </div>
            <div className="w-full ">
              <label className="block mt-4 text-sm leading-4 text-[#00000066] font-medium">
                Message
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={enquiry.message}
                readOnly
              />
            </div>

            {/* Show Enquiry Remark List */}
            <div className="w-full ">
              <h2 className="font-semibold mt-6 ">Enquiry Remark List</h2>

              <div className="mt-2 flex flex-col gap-2">
                {remarkList.length > 0 ? (
                  remarkList.map((remark, index) => (
                    <div key={index} className="w-full">
                      <label className="block mt-4 text-sm leading-4 text-[#00000066] font-medium">
                        <span
                          className={`px-2 py-1 rounded-md ${
                            remark?.status === "New"
                              ? "bg-[#EAFBF1] text-[#0BB501]"
                              : remark?.status === "Visit Scheduled"
                              ? "bg-[#E9F2FF] text-[#0068FF]"
                              : remark?.status === "Token"
                              ? "bg-[#FFF8DD] text-[#FFCA00]"
                              : remark?.status === "Cancelled"
                              ? "bg-[#FFEAEA] text-[#ff2323]"
                              : remark?.status === "Follow Up"
                              ? "bg-[#F4F0FB] text-[#5D00FF]"
                              : "text-[#000000]"
                          }`}
                        >
                          {new Date(remark?.created_at).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                          {" - "} {remark?.status}
                        </span>
                      </label>
                      <div className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px]">
                        <span
                          className={`${
                            remark?.status === "New"
                              ? " text-[#0BB501]"
                              : remark?.status === "Visit Scheduled"
                              ? " text-[#0068FF]"
                              : remark?.status === "Token"
                              ? " text-[#FFCA00]"
                              : remark?.status === "Cancelled"
                              ? " text-[#ff2323]"
                              : remark?.status === "Follow Up"
                              ? " text-[#5D00FF]"
                              : "text-[#000000]"
                          }`}
                        >
                          {remark?.visitdate}
                        </span>{" "}
                        {remark.remark}
                      </div>
                    </div>
                  ))
                ) : (
                  <input
                    type="text"
                    disabled
                    className="w-full text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value="No Remark Found"
                    readOnly
                  />
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Enquirers;
