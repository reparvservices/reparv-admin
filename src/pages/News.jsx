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
import { getImageURI } from "../utils/helper";

const News = () => {
  const {
    URI,
    setLoading,
    showNewsForm,
    setShowNewsForm,
    showSeoForm,
    setShowSeoForm,
  } = useAuth();

  const [news, setNews] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newsId, setNewsId] = useState(null);
  const [newNews, setNewNews] = useState({
    type: "All",
    state: "",
    city: "",
    title: "",
    description: "",
    content: "",
  });
  const [seoActive, setSeoActive] = useState(false);
  const [seoSlug, setSeoSlug] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  //Blog Image Upload
  const [selectedImage, setSelectedImage] = useState(null);
  const singleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Allowed file types
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG, JPG and JPEG formats are allowed!");
      event.target.value = ""; // reset input
      return;
    }

    // File size check (1 MB max)
    if (file.size > 1 * 1024 * 1024) {
      alert("File size must be less than 1MB!");
      event.target.value = ""; // reset input
      return;
    }

    // If valid, set state
    setSelectedImage(file);
    setNewNews((prev) => ({ ...prev, newsImage: file }));
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
      const response = await fetch(`${URI}/admin/cities/${newNews?.state}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch cities.");
      const data = await response.json();
      setCities(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // **Fetch Data from API**
  const fetchData = async () => {
    try {
      const response = await fetch(URI + "/admin/news", {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch News.");
      const data = await response.json();
      console.log(data);
      setNews(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //fetch data on form
  const edit = async (id) => {
    try {
      const response = await fetch(URI + `/admin/news/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch news.");
      const data = await response.json();

      setNewNews({
        id: data.id || "",
        type: data.type || "All",
        state: data.state || "",
        city: data.city || "",
        title: data.title || "",
        description: data.description || "",
        content: data.content || "",
      });

      // Only show form after blog data is loaded
      setShowNewsForm(true);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  const add = async (e) => {
    e.preventDefault();

    const endpoint = newNews.id ? `edit/${newNews.id}` : "add";
    const method = newNews.id ? "PUT" : "POST";

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("type", newNews.type);
      formData.append("state", newNews.state);
      formData.append("city", newNews.city);
      formData.append("title", newNews.title);
      formData.append("description", newNews.description);
      formData.append("content", newNews.content);

      // Append image if selected
      if (selectedImage) {
        formData.append("newsImage", newNews.newsImage);
      }

      const response = await fetch(`${URI}/admin/news/${endpoint}`, {
        method,
        credentials: "include",
        body: formData, // No need for headers, browser sets it
      });

      if (response.status === 409) {
        alert("News already exists!");
      } else if (!response.ok) {
        throw new Error(`Failed to save news. Status: ${response.status}`);
      } else {
        alert(
          newNews.id
            ? "News updated successfully!"
            : "News added successfully!",
        );

        setNewNews({
          type: "",
          state: "",
          city: "",
          title: "",
          description: "",
          content: "",
        });

        setShowNewsForm(false);
        setSelectedImage(null);
        await fetchData();
      }
    } catch (err) {
      console.error("Error saving news:", err);
    } finally {
      setLoading(false);
    }
  };

  // change status record
  const status = async (id) => {
    if (!window.confirm("Are you sure you want to change this News status?"))
      return;

    try {
      const response = await fetch(URI + `/admin/news/status/${id}`, {
        method: "PUT",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(response);
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
      const response = await fetch(URI + `/admin/news/${id}`, {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch news.");
      const data = await response.json();
      setSeoSlug(data.seoSlug);
      setSeoTitle(data.seoTitle);
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
      const response = await fetch(URI + `/admin/news/seo/${newsId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seoSlug, seoTitle, seoDescription }),
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
      setSeoTitle("");
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
    if (!window.confirm("Are you sure you want to delete this News?")) return;

    try {
      setLoading(true);
      const response = await fetch(URI + `/admin/news/delete/${id}`, {
        method: "DELETE",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        alert("News deleted successfully!");
        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting News:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStates();
  }, []);

  useEffect(() => {
    if (newNews.state != "") {
      fetchCities();
    }
  }, [newNews.state]);

  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  const filteredData = news?.filter((item) => {
    const matchesSearch =
      item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase());

    let startDate = range[0].startDate;
    let endDate = range[0].endDate;

    if (startDate) startDate = new Date(startDate.setHours(0, 0, 0, 0));
    if (endDate) endDate = new Date(endDate.setHours(23, 59, 59, 999));

    const itemDate = parse(
      item.created_at,
      "dd MMM yyyy | hh:mm a",
      new Date(),
    );

    const matchesDate =
      (!startDate && !endDate) ||
      (startDate && endDate && itemDate >= startDate && itemDate <= endDate);

    /* SEO filter */
    const isSeoMissing =
      !item.seoSlug?.trim() ||
      !item.seoTitle?.trim() ||
      !item.seoDescription?.trim();

    const matchesSeo = seoActive ? isSeoMissing : true;

    /* Final decision */
    return matchesSearch && matchesDate && matchesSeo;
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
      name: "News Image",
      cell: (row) => {
        let imageSrc =
          getImageURI(row.image) ||
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c";
        return (
          <div className="w-[130px] h-14 overflow-hidden flex items-center justify-center">
            <img
              src={imageSrc}
              alt="newsImage"
              onClick={() => {
                window.open(
                  "https://www.reparv.in/news/" + row.seoSlug,
                  "_blank",
                );
              }}
              className="w-full h-[100%] object-cover cursor-pointer"
            />
          </div>
        );
      },
      width: "130px",
    },
    { name: "Date & Time", selector: (row) => row.created_at, width: "200px" },
    {
      name: "News Type",
      selector: (row) => row.type,
      minWidth: "150px",
    },
    {
      name: "News Title",
      selector: (row) => row.title,
      sortable: true,
      minWidth: "150px",
      maxWidth: "250px",
    },
    {
      name: "Description",
      selector: (row) => row.description,
      sortable: true,
      minWidth: "350px",
      maxWidth: "600px",
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
          window.open("https://www.reparv.in/news/" + slug, "_blank");
          break;
        case "status":
          status(id);
          break;
        case "update":
          setNewsId(id);
          edit(id);
          break;
        case "manageFAQs":
          window.open(`/blog/manage-faqs/${id}`, "_blank");
          break;
        case "SEO":
          setNewsId(id);
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
          <option value="view">View</option>
          <option value="status">Status</option>
          <option value="update">Update</option>
          <option value="SEO">SEO Details</option>
          {/*<option value="manageFAQs">Manage FAQs</option>*/}
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
        <div className="w-full flex items-center justify-between md:justify-end gap-1 sm:gap-3">
          <p className="block md:hidden text-lg font-semibold">News</p>
          <div className="flex xl:hidden flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
            <DownloadCSV data={filteredData} filename={"News.csv"} />
            <AddButton label={"Add"} func={setShowNewsForm} />
          </div>
        </div>
        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search News"
              className="search-input w-[250px] h-[36px] text-sm text-black bg-transparent border-none outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="rightTableHead w-full lg:w-[70%] sm:h-[36px] gap-2 flex flex-wrap justify-end items-center">
            <div
              onClick={() => {
                setSeoActive(!seoActive);
              }}
              className={`${seoActive && "bg-red-100 text-red-600"} border w-24 flex items-center justify-center font-medium rounded-lg text-sm px-4 py-2 cursor-pointer active:scale-95`}
            >
              <span>Not SEO</span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 px-2">
              <div className="block">
                <CustomDateRangePicker range={range} setRange={setRange} />
              </div>
            </div>
            <div className="hidden xl:flex flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
              <DownloadCSV data={filteredData} filename={"News.csv"} />
              <AddButton label={"Add"} func={setShowNewsForm} />
            </div>
          </div>
        </div>
        <h2 className="text-[16px] font-semibold">News List</h2>
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
          showNewsForm ? "flex" : "hidden"
        } z-[61] sales-form overflow-scroll scrollbar-hide w-full fixed bottom-0 md:bottom-auto`}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] lg:w-[780px] xl:w-[1000px] max-h-[80vh] bg-white py-8 pb-10 px-3 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">
              {newNews.id ? "Edit News" : "Add News"}
            </h2>

            <IoMdClose
              onClick={() => {
                setShowNewsForm(false);
                setNewNews({
                  id: null,
                  type: "All",
                  state: "",
                  city: "",
                  title: "",
                  description: "",
                  content: "",
                });
                setSelectedImage(null);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>

          <form onSubmit={add}>
            <div className="grid md:gap-2 grid-cols-1">
              <input type="hidden" value={newNews.id || ""} readOnly />

              {/* IMAGE */}
              <div className="w-full">
                <label className="block text-sm text-[#00000066] font-medium mb-2">
                  Upload News Image
                </label>

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
                  <div className="w-[107px] p-5 bg-[#000000B2] text-white">
                    Browse
                  </div>
                </label>

                {selectedImage && (
                  <div className="relative mt-2 max-w-[300px]">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      className="w-full rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeSingleImage}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* TYPE */}
              <div>
                <label className="block text-sm text-[#00000066] font-medium mt-2">
                  News Type
                </label>

                <select
                  required
                  value={newNews.type}
                  onChange={(e) =>
                    setNewNews({ ...newNews, type: e.target.value })
                  }
                  className="w-full mt-2 p-4 border rounded"
                >
                  <option value="All">All</option>
                  <option value="Updates">Updates</option>
                  <option value="Announcements">Announcements</option>
                  <option value="Market News">Market News</option>
                  <option value="Rules & Laws">Rules & Laws</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="w-full flex gap-4 mt-2">
                {/* State Select Input */}
                <div className="w-full">
                  <label className="block text-sm leading-4 text-[#00000066] font-medium">
                    Select State
                  </label>
                  <select
                    required
                    className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
                    style={{ backgroundImage: "none" }}
                    value={newNews.state}
                    onChange={(e) =>
                      setNewNews({ ...newNews, state: e.target.value })
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
                    Select City
                  </label>
                  <select
                    required
                    className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
                    style={{ backgroundImage: "none" }}
                    value={newNews.city}
                    onChange={(e) =>
                      setNewNews({
                        ...newNews,
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
              </div>
              {/* TITLE */}
              <div>
                <label className="block text-sm text-[#00000066] font-medium mt-2">
                  News Title
                </label>
                <textarea
                  rows={2}
                  required
                  value={newNews.title}
                  onChange={(e) =>
                    setNewNews({ ...newNews, title: e.target.value })
                  }
                  className="w-full mt-2 p-4 border rounded"
                  placeholder="Enter News Title"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm text-[#00000066] font-medium">
                  News Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={newNews.description}
                  onChange={(e) =>
                    setNewNews({ ...newNews, description: e.target.value })
                  }
                  className="w-full mt-2 p-4 border rounded"
                />
              </div>

              {/* CONTENT */}
              <div className="mt-3">
                <label className="block text-sm text-[#00000066] font-medium mb-2">
                  News Content
                </label>

                <div className="border rounded blog-content ck-content">
                  {showNewsForm && (
                    <CKEditor
                      editor={ClassicEditor}
                      data={newNews.content}
                      onChange={(e, editor) =>
                        setNewNews({
                          ...newNews,
                          content: editor.getData(),
                        })
                      }
                    />
                  )}
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => setShowNewsForm(false)}
                className="px-4 py-2 bg-[#000000B2] text-white rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#076300] text-white rounded"
              >
                Save
              </button>
              <Loader />
            </div>
          </form>
        </div>
      </div>

      {/* ADD SEO Details */}
      <div
        className={`${
          !showSeoForm && "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto`}
      >
        <div className="w-full max-h-[70vh] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">SEO Details</h2>
            <IoMdClose
              onClick={() => {
                setShowSeoForm(false);
                setSeoSlug("");
                setSeoTitle("");
                setSeoDescription("");
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>

          <form onSubmit={addSeoDetails}>
            <input type="hidden" value={newsId || ""} />

            {/* SEO SLUG */}
            <div className="w-full mb-3">
              <label className="block text-sm text-[#00000066] font-medium">
                SEO Slug
              </label>
              <input
                type="text"
                required
                placeholder="example-news-title"
                value={seoSlug}
                onChange={(e) => setSeoSlug(e.target.value)}
                className="w-full mt-2 p-4 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                URL friendly (lowercase, hyphens)
              </p>
            </div>

            {/* SEO TITLE */}
            <div className="w-full mb-3">
              <label className="block text-sm text-[#00000066] font-medium">
                SEO Title
              </label>
              <textarea
                rows={2}
                required
                maxLength={60}
                placeholder="Max 60 characters"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full mt-2 p-4 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* SEO DESCRIPTION */}
            <div className="w-full mb-4">
              <label className="block text-sm text-[#00000066] font-medium">
                SEO Description
              </label>
              <textarea
                rows={4}
                required
                maxLength={160}
                placeholder="Max 160 characters"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full mt-2 p-4 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-6 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowSeoForm(false);
                  setSeoTitle("");
                  setSeoDescription("");
                }}
                className="px-4 py-2 bg-[#000000B2] text-white rounded"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-[#076300] text-white rounded"
              >
                Add SEO Details
              </button>

              <Loader />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default News;
