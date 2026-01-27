import React from "react";
import { parse } from "date-fns";
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import AddButton from "../components/AddButton";
import FilterData from "../components/FilterData";
import { IoMdClose } from "react-icons/io";
import DataTable from "react-data-table-component";
import { FiMoreVertical } from "react-icons/fi";
import Loader from "../components/Loader";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import DownloadCSV from "../components/DownloadCSV";

const Trends = () => {
  const {
    URI,
    setLoading,
    showTrendForm,
    setShowTrendForm,
    showSeoForm,
    setShowSeoForm,
  } = useAuth();
  const ImageURI = import.meta.env.VITE_S3_IMAGE_URL;

  const [trends, setTrends] = useState([]);
  const [trendId, setTrendId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [newTrend, setNewTrend] = useState({
    trendName: "",
    content: "",
  });
  const [seoSlug, setSeoSlug] = useState("");
    const [seoTittle, setSeoTittle] = useState("");
    const [seoDescription, setSeoDescription] = useState("");
  
  //Trend Image Upload
  const [selectedImage, setSelectedImage] = useState(null);
  const singleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.size <= 1 * 1024 * 1024) {
      setSelectedImage(file);
      setNewTrend((prev) => ({ ...prev, trendImage: file }));
    } else {
      alert("File size must be less than 1MB");
    }
  };
  const removeSingleImage = () => {
    setSelectedImage(null);
  };

  // **Fetch Data from API**
  const fetchData = async () => {
    try {
      const response = await fetch(URI + "/admin/trend", {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch trends.");
      const data = await response.json();
      //console.log(data);
      setTrends(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //fetch data on form
  const edit = async (id) => {
    try {
      const response = await fetch(URI + `/admin/trend/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch blog.");
      const data = await response.json();

      setNewTrend({
        id: data.id || "",
        trendName: data.trendName || "",
        content: data.content || "",
      });
      
      // Only show form after blog data is loaded
      setShowTrendForm(true);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  const add = async (e) => {
    e.preventDefault();

    const endpoint = newTrend.id ? `edit/${newTrend.id}` : "add";
    const method = newTrend.id ? "PUT" : "POST";

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("trendName", newTrend.trendName);
      formData.append("content", newTrend.content);
      // Append image if selected
      if (selectedImage) {
        formData.append("trendImage", newTrend.trendImage);
      }

      const response = await fetch(`${URI}/admin/trend/${endpoint}`, {
        method,
        credentials: "include",
        body: formData, // No need for headers, browser sets it
      });

      if (response.status === 409) {
        alert("Trend already exists!");
      } else if (!response.ok) {
        throw new Error(`Failed to save trend. Status: ${response.status}`);
      } else {
        alert(
          newTrend.id ? "Trend updated successfully!" : "Trend added successfully!"
        );

        setNewTrend({
          trendName: "",
          content: "",
        });
        setSelectedImage(null);
        setShowTrendForm(false);
        await fetchData();
      }
    } catch (err) {
      console.error("Error saving trend:", err);
    } finally {
      setLoading(false);
    }
  };

  // change status record
  const status = async (id) => {
    if (!window.confirm("Are you sure you want to change this Trend status?"))
      return;

    try {
      const response = await fetch(URI + `/admin/trend/status/${id}`, {
        method: "PUT",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      //console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      fetchData();
    } catch (error) {
      console.error("Error changing status :", error);
    }
  };

  //fetch data on form
  const showSEO = async (id) => {
    try {
      const response = await fetch(URI + `/admin/trend/${id}`, {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch trend.");
      const data = await response.json();
      console.log(data);
      setSeoSlug(data.seoSlug);
      setSeoTittle(data.seoTittle);
      setSeoDescription(data.seoDescription);
      setShowSeoForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // Add Or Update SEO Details Tittle , Description
  const addSeoDetails = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(URI + `/admin/trend/seo/${trendId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seoSlug, seoTittle, seoDescription }),
      });
      const data = await response.json();
      console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      setShowSeoForm(false);
      setSeoSlug("");
      setSeoTittle("");
      setSeoDescription("");
      await fetchData();
    } catch (error) {
      console.error("Error adding Seo Details :", error);
    } finally {
      setLoading(false);
    }
  };

  //Delete record
  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Trend?")) return;

    try {
      setLoading(true);
      const response = await fetch(URI + `/admin/trend/delete/${id}`, {
        method: "DELETE",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        alert("Trend deleted successfully!");
        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting Trend:", error);
    } finally {
      setLoading(false);
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

  const filteredData = trends.filter((item) => {
    const matchesSearch =
      item.tittle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase());

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
            className={`min-w-6 flex items-center justify-center px-2 py-1 rounded-md cursor-pointer ${
              row.status === "Active"
                ? "bg-[#EAFBF1] text-[#0BB501]"
                : "bg-[#FFEAEA] text-[#ff2323]"
            }`}
          >
            {index + 1}
          </span>

          {/* Tooltip */}
          <div className="absolute w-[65px] text-center -top-12 left-[30px] -translate-x-1/2 px-2 py-2 rounded bg-black text-white text-xs hidden group-hover:block transition">
            {row.status === "Active" ? "Active" : "Inactive"}
          </div>
        </div>
      ),
      width: "70px",
    },
    {
      name: "Trend Image",
      cell: (row) => {
        let imageSrc =
          ImageURI + row.image ||
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c";
        return (
          <div className="w-[130px] h-14 overflow-hidden flex items-center justify-center">
            <img
              src={imageSrc}
              alt="blogImage"
              onClick={() => {
                window.open(
                  "https://www.reparv.in/blog/" + row.seoSlug,
                  "_blank"
                );
              }}
              className="w-full h-[90%] object-cover cursor-pointer"
            />
          </div>
        );
      },
      width: "130px",
    },
    { name: "Date & Time", selector: (row) => row.created_at, width: "200px" },
    {
      name: "Trend Name",
      selector: (row) => row.trendName,
      sortable: true,
      minWidth: "150px",
      maxWidth: "250px",
    },
    {
      name: "Action",
      cell: (row) => <ActionDropdown row={row} />,
      width: "120px",
    },
  ];

  const ActionDropdown = ({ row }) => {
    const [selectedAction, setSelectedAction] = useState("");

    const handleActionSelect = (action, id, slug) => {
      switch (action) {
        case "view":
          window.open("https://www.reparv.in/blog/" + slug, "_blank");
          break;
        case "status":
          status(id);
          break;
        case "update":
          setTrendId(id);
          edit(id);
          break;
        case "SEO":
          setTrendId(id);
          showSEO(id);
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
            handleActionSelect(action, row.id, row.seoSlug);
          }}
        >
          <option value="" disabled>
            Select Action
          </option>
          {/* <option value="view">View</option> */}
          <option value="status">Status</option>
          <option value="update">Update</option>
          <option value="SEO">SEO Details</option>
          <option value="delete">Delete</option>
        </select>
      </div>
    );
  };

  return (
    <div
      className={`sales Persons overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start`}
    >
      <div className="sales-table w-full h-[80vh] flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white md:rounded-[24px]">
        <div className="w-full flex items-center justify-between md:justify-end gap-1 sm:gap-3">
          <p className="block md:hidden text-lg font-semibold">Trends</p>
          <div className="flex xl:hidden flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
            <DownloadCSV data={filteredData} filename={"Trend.csv"} />
            <AddButton label={"Add"} func={setShowTrendForm} />
          </div>
        </div>
        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search Trend"
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
              <DownloadCSV data={filteredData} filename={"Trend.csv"} />
              <AddButton label={"Add"} func={setShowTrendForm} />
            </div>
          </div>
        </div>
        <h2 className="text-[16px] font-semibold"> Trends List</h2>
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

      <div
        className={`${
          showTrendForm ? "flex" : "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full max-h-[80vh] fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] max-h-[85vh] bg-white py-8 pb-10 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">ADD Trend </h2>

            <IoMdClose
              onClick={() => {
                setShowTrendForm(false);
                setNewTrend({
                  content: "",
                });
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={add}>
            <div className="grid md:gap-2 grid-cols-1">
              <input type="hidden" value={newTrend.id || ""} readOnly />
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
                  Upload Trend Image
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
                    className="flex items-center justify-between border border-gray-300 rounded cursor-pointer"
                  >
                    <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                      Upload Image
                    </span>
                    <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                      Browse
                    </div>
                  </label>
                </div>

                {/* Image Preview */}
                {selectedImage && (
                  <div className="relative mt-2 w-full max-w-[300px]">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Uploaded preview"
                      className="w-full object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeSingleImage}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className={`w-full `}>
                <label
                  htmlFor="trendName"
                  className="block text-sm leading-4 text-[#00000066] font-medium mt-2"
                >
                  Trend Name
                </label>
                <textarea
                  rows={2}
                  cols={40}
                  id="trendName"
                  placeholder="Enter Trend Name"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newTrend?.trendName || ""}
                  onChange={(e) => {
                    setNewTrend({ ...newTrend, trendName: e.target.value });
                  }}
                />
              </div>

              <div className="w-full mt-[10px]">
                <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
                  Trend Content
                </label>
                <div className="border border-[#00000033] rounded-[4px] overflow-hidden">
                  {showTrendForm && newTrend.content !== undefined && (
                    <CKEditor
                      key={newTrend.id || "new"}
                      editor={ClassicEditor}
                      data={newTrend.content}
                      onChange={(e, editor) => {
                        setNewTrend({ ...newTrend, content: editor.getData() });
                      }}
                      config={{
                        placeholder: "Enter Trend Content",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="flex h-10 mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowTrendForm(false);
                  setNewTrend({
                    trendName: "",
                    content: "",
                  });
                  setSelectedImage(null);
                }}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Save
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>

      {/* ADD SEO Details */}
      <div
        className={` ${
          !showSeoForm && "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full max-h-[80vh] overflow-scroll scrollbar-hide md:w-[500px] bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">SEO Details</h2>
            <IoMdClose
              onClick={() => {
                setShowSeoForm(false);
                setSeoSlug("");
                setSeoTittle("");
                setSeoDescription("");
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={addSeoDetails}>
            <div className="w-full grid gap-2 place-items-center grid-cols-1 lg:grid-cols-1">
              <input
                type="hidden"
                value={trendId || ""}
                onChange={(e) => setTrendId(e.target.value)}
              />
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium ">
                  Seo Slug
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Slug"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={seoSlug}
                  onChange={(e) => {
                    setSeoSlug(e.target.value);
                  }}
                />
              </div>
              <div className={`w-full `}>
                <label className="block text-sm leading-4 text-[#00000066] font-medium ">
                  Seo Tittle
                </label>
                <textarea
                  rows={2}
                  cols={40}
                  placeholder="Enter Tittle"
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={seoTittle}
                  onChange={(e) => setSeoTittle(e.target.value)}
                />
              </div>
              <div className={`w-full `}>
                <label className="block text-sm leading-4 text-[#00000066] font-medium ">
                  Seo Description
                </label>
                <textarea
                  rows={4}
                  cols={40}
                  placeholder="Enter Description"
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowSeoForm(false);
                  setSeoSlug("");
                  setSeoTittle("");
                  setSeoDescription("");
                }}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Add SEO Details
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Trends;
