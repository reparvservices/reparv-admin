import React from "react";
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import AddButton from "../components/AddButton";
import { IoMdClose } from "react-icons/io";
import DataTable from "react-data-table-component";
import { FiMoreVertical } from "react-icons/fi";
import Loader from "../components/Loader";

const Slider = () => {
  const {
    showSliderForm,
    setShowSliderForm,
    URI,
    setLoading,
    showAddMobileImage,
    setShowAddMobileImage,
  } = useAuth();
  const [data, setData] = useState([]);
  const [sliderId, setSliderId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // **Fetch Data from API**
  const fetchData = async () => {
    try {
      const response = await fetch(URI + "/admin/slider", {
        method: "GET",
        credentials: "include", // ✅ Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch slider Images.");
      const data = await response.json();
      setData(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //Slider Images Uploader
  const [images, setImages] = useState([]);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  //Add Images
  const addImages = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append("images[]", image);
      });
    }

    try {
      setLoading(true);
      const response = await fetch(`${URI}/admin/slider/addimages`, {
        method: "POST",
        credentials: "include",
        body: formData, // FormData allows file uploads
      });

      if (!response.ok) {
        throw new Error(`Failed to save property. Status: ${response.status}`);
      } else {
        alert("Images Uploaded Successfully!");
      }

      // Reset after upload
      setImages([]);
      setShowSliderForm(false);
      await fetchData();
    } catch (err) {
      console.error("Error saving Slider Images:", err);
    } finally {
      setLoading(false);
    }
  };

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

  //Add  Mobile Screen Images
  const addMobileImage = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      setLoading(true);
      const response = await fetch(`${URI}/admin/slider/small/addimage/${sliderId}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to save property. Status: ${response.status}`);
      } else {
        alert("Image Uploaded Successfully!");
      }

      // Reset after upload
      setSelectedImage();
      setShowAddMobileImage(false);
      await fetchData();
    } catch (err) {
      console.error("Error saving small screen slider image:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete Image
  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Slider Image?"))
      return;

    try {
      const response = await fetch(URI + `/admin/slider/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        alert("Slider image deleted successfully!");

        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting :", error);
    } finally {
      setLoading(false);
    }
  };

  // change status record
  const status = async (id) => {
    if (!window.confirm("Are you sure you want to change this image status?"))
      return;

    try {
      const response = await fetch(URI + `/admin/slider/status/${id}`, {
        method: "PUT",
        credentials: "include",
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
      console.error("Error deleting :", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter((item) =>
    item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      name: "Images",
      cell: (row) => (
        <div
          className={`w-[340px] h-[110px] lg:h-[120px] xl:h-[150px] overflow-hidden flex items-center justify-center`}
        >
          <img
            src={`${URI}/uploads/${row.image}`}
            alt="Image"
            className="w-[340px] h-[90%] object- cursor-pointer"
          />
        </div>
      ),
      maxWidth: "340px",
    },
    {
      name: "Mobile Image",
      cell: (row) => (
        <div
          className={`w-full h-[110px] lg:h-[120px] xl:h-[150px] overflow-hidden flex items-center justify-start`}
        >
          <img
            src={`${URI}/uploads/${row.mobileimage}`}
            alt="Image"
            className={`${
              row.mobileimage == null ? "hidden" : "block"
            } w-[100px] h-[100px] object- cursor-pointer`}
          />
          <span className={`${row.mobileimage == null ? "block" : "hidden"}`}>
            -- NO IMAGE --
          </span>
        </div>
      ),
      width: "160px",
    },
    {
      name: "Action",
      cell: (row) => <ActionDropdown row={row} />,
      width: "130px",
    },
  ];

  const ActionDropdown = ({ row }) => {
    const [selectedAction, setSelectedAction] = useState("");

    const handleActionSelect = (action, id) => {
      switch (action) {
        case "mobileImage":
          // Add Mobile Image
          setSliderId(id);
          setShowAddMobileImage(true);
          break;
        case "status":
          status(id);
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
          <option value="mobileImage">Add Mobile Image</option>
          <option value="status">Status</option>
          <option value="delete">Delete</option>
        </select>
      </div>
    );
  };

  return (
    <div
      className={`slider overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start`}
    >
      <div
        className={`flex role-table w-full h-[80vh] flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white rounded-[24px]`}
      >
        <p className="block md:hidden text-lg font-semibold">Slider</p>
        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search Image"
              className="search-input w-[250px] h-[36px] text-sm text-black bg-transparent border-none outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="rightTableHead w-full lg:w-[70%] sm:h-[36px] gap-2 flex flex-wrap justify-end items-center">
            <AddButton label={"Add"} func={setShowSliderForm} />
          </div>
        </div>
        <h2 className="text-[16px] font-semibold">Slider Images List</h2>
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
          showSliderForm ? "flex" : "hidden"
        } z-[61] sliderForm overflow-scroll scrollbar-hide  w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full md:w-[500px] overflow-scroll scrollbar-hide bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">
              Add Slider Images (1440px X 540px)
            </h2>
            <IoMdClose
              onClick={() => {
                setShowSliderForm(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form
            onSubmit={addImages}
            className="w-full grid gap-4 place-items-center grid-cols-1"
          >
            <div className="w-full">
              <div className="w-full mt-2">
                <input
                  type="file"
                  required
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="images"
                />
                <label
                  htmlFor="images"
                  className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer"
                >
                  <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                    Upload Images
                  </span>
                  <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                    Browse
                  </div>
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((image, index) => {
                  const imageUrl = URL.createObjectURL(image);
                  return (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt="Uploaded preview"
                        className={`w-full h-24 object-cover rounded-lg border ${
                          index === 0
                            ? "border-4 border-blue-500"
                            : "border-gray-300"
                        }`}
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs p-1 rounded-full"
                      >
                        ✕
                      </button>
                      {index === 0 && (
                        <p className="text-xs text-blue-500 text-center mt-1">
                          Main Image
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Upload Images
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>

      <div
        className={`${
          showAddMobileImage ? "flex" : "hidden"
        } z-[61] FeedBackForm overflow-scroll scrollbar-hide  w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full md:w-[500px] max-h-[70vh] overflow-scroll scrollbar-hide bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">
              Add Small Screen Image. (390px / 400px)
            </h2>
            <IoMdClose
              onClick={() => {
                setShowAddMobileImage(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form
            onSubmit={addMobileImage}
            className="w-full grid gap-4 place-items-center grid-cols-1"
          >
            <div className="w-full">
              <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
                Upload Small Screen Image
              </label>
              <div className="w-full mt-2">
                <input
                  type="file"
                  accept="image/*"
                  required
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
            <div className="w-full flex h-10 mt-8 md:mt-6 items-center justify-center gap-6">
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Add Image
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Slider;
