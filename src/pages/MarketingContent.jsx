import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import ActionSelect from "../components/ActionSelect";
import AddButton from "../components/AddButton";
import { IoMdClose } from "react-icons/io";
import { FaDownload, FaPlay } from "react-icons/fa";
import DataTable from "react-data-table-component";
import Loader from "../components/Loader";
import { MdOutlineWidthFull } from "react-icons/md";
import { PiDotsThreeCircleVerticalFill } from "react-icons/pi";
import propertyPicture from "../assets/propertyPicture.svg";
import ContentFilter from "../components/ContentFilter";

const MarketingContent = () => {
  const {
    showContentUploadForm,
    setShowContentUploadForm,
    filterStatus,
    setFilterStatus,
    action,
    URI,
    setLoading,
  } = useAuth();
  const ImageURI = import.meta.env.VITE_S3_IMAGE_URL;

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newContent, setNewContent] = useState({
    contentType: "",
    contentName: "",
    contentFile: null,
  });

  // **Fetch Data from API**
  const fetchData = async () => {
    try {
      const response = await fetch(URI + "/admin/marketing-content", {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch content.");
      const data = await response.json();
      setData(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //Add or update record
  const addOrUpdate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("contentType", newContent.contentType);
      formData.append("contentName", newContent.contentName);
      if (newContent.contentFile) {
        formData.append("contentFile", newContent.contentFile);
      }

      const method = newContent.id ? "PUT" : "POST";
      const endpoint = newContent.id ? `edit/${newContent.id}` : "add";

      const response = await fetch(
        URI + `/admin/marketing-content/${endpoint}`,
        {
          method,
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to save content.");

      if (newContent.id) {
        alert(`Content updated successfully!`);
      } else if (response.status === 202) {
        alert(`Content already exists!`);
      } else {
        alert(`Content added successfully!`);
      }

      setNewContent({
        contentType: "",
        contentName: "",
        contentFile: null,
      });
      fetchData();
      setShowContentUploadForm(false);
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setLoading(false);
    }
  };

  //fetch data on form
  const fetchContent = async (id) => {
    try {
      const response = await fetch(URI + `/admin/marketing-content/${id}`, {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch content.");
      const data = await response.json();
      setNewContent(data);
      setShowContentUploadForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // Delete record
  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content ?"))
      return;
    try {
      const response = await fetch(
        URI + `/admin/marketing-content/delete/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("content deleted successfully!");

        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting :", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getContentCounts = (data) => {
    return data.reduce(
      (acc, item) => {
        if (item.contentType === "Image") {
          acc.Image++;
        } else if (item.contentType === "Video") {
          acc.Video++;
        }
        return acc;
      },
      { Image: 0, Video: 0 }
    );
  };

  const contentCounts = getContentCounts(data);

  // Helper: returns "Image", "Video", "Image, Video", or ""
  const getContentType = (data) => {
    const hasImage = data.some((item) => item.contentType === "Image");
    const hasVideo = data.some((item) => item.contentType === "Video");

    if (hasImage && hasVideo) return "New";
    if (hasImage) return "Image";
    if (hasVideo) return "Video";
    return "";
  };

  // Main filter logic
  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.contentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contentType.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesContent = data;
    if (filterStatus === "Image" || filterStatus === "Video") {
      matchesContent = !filterStatus || item.contentType === filterStatus;
    }

    return matchesSearch && matchesContent;
  });

  // Optional: get the type summary of filtered content
  const contentTypeSummary = getContentType(filteredData);

  const ActionDropdown = ({ content }) => {
    const [selectedAction, setSelectedAction] = useState("");

    const handleActionSelect = (action, id, url) => {
      switch (action) {
        case "view":
          window.open(`${URI}/${url}`, "_blank");
          break;
        case "update":
          fetchContent(id);
          break;
        case "delete":
          del(id);
          break;
        default:
          console.log("Invalid action");
      }
    };

    return (
      <div className="relative inline-block">
        <PiDotsThreeCircleVerticalFill className="w-[22px] h-[22px] text-black cursor-pointer" />
        <select
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          value={selectedAction}
          onChange={(e) => {
            const action = e.target.value;
            handleActionSelect(action, content.id, content.contentFile);
          }}
        >
          <option value="" disabled>
            Select Action
          </option>
          <option value="view">View</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>
      </div>
    );
  };

  return (
    <div
      className={`overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start`}
    >
      <div className="role-table w-full h-[80vh] flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white md:rounded-[24px]">
        {/* <p className="block md:hidden text-lg font-semibold">Role</p> */}
        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
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
            <ContentFilter counts={contentCounts} />
            <AddButton label={"Add"} func={setShowContentUploadForm} />
          </div>
        </div>
        <h2 className="text-[16px] font-semibold">Content List</h2>

        <div>
          {filteredData?.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {filteredData?.map((content) => (
                <div key={content.id} className="flex flex-col items-center">
                  <div
                    onClick={() => {
                      window.open(`${URI}/${content.contentFile}`, "_blank");
                    }}
                    className="relative w-full border border-[#00000033] rounded-lg overflow-hidden aspect-[16/9] shadow cursor-pointer"
                  >
                    {content.contentType === "Video" ? (
                      <video
                        src={`${ImageURI}/${content.contentFile}`}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={`${ImageURI}/${content.contentFile}`}
                        alt={content.contentName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="w-full flex items-center justify-between gap-2 py-3 pl-1">
                    <p className="text-sm font-medium">
                      {content.contentName.length > 26
                        ? `${content.contentName.slice(0, 25)}...`
                        : content.contentName}
                    </p>

                    <div className="flex gap-2 items-center justify-center">
                      {/* <a href={`${URI}/${content.contentFile}`} download >
                        <FaDownload />
                      </a> */}
                      <ActionDropdown content={content} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-black text-lg">
              There is no content to display.
            </div>
          )}
        </div>
      </div>

      <div
        className={`${
          showContentUploadForm ? "flex" : "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full fixed  bottom-0 md:bottom-auto`}
      >
        <div className="w-full md:w-[500px] max-h-[90vh] overflow-scroll scrollbar-hide bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Upload Content</h2>
            <IoMdClose
              onClick={() => {
                setShowContentUploadForm(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>

          <form onSubmit={addOrUpdate}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1 ">
              <input
                type="hidden"
                value={newContent.id || ""}
                onChange={(e) =>
                  setNewContent({ ...newContent, id: e.target.value })
                }
              />

              {/* Apk Name Select */}
              <div className="w-full ">
                <label className="block text-sm text-[#0000007b] leading-4 font-medium">
                  Content Type
                </label>
                <select
                  required
                  disabled={!!newContent.id}
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
                  value={newContent.contentType}
                  onChange={(e) =>
                    setNewContent({
                      ...newContent,
                      contentType: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Select Content Type
                  </option>
                  <option value="Image">Image</option>
                  <option value="Video">Video</option>
                </select>
              </div>

              <div className="w-full text-[#0000007b]">
                <label className="block text-sm text-[#0000007b] leading-4 font-medium">
                  Content Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Content Name"
                  value={newContent.contentName}
                  onChange={(e) => {
                    setNewContent({
                      ...newContent,
                      contentName: e.target.value,
                    });
                  }}
                  className="w-full mt-[10px] text-[16px] font-medium p-3 border border-[#00000033] text-black placeholder:text-black rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              {/* File Upload */}
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#0000007b] font-medium">
                  Upload Content File
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600"
                  onChange={(e) =>
                    setNewContent({
                      ...newContent,
                      contentFile: e.target.files[0],
                    })
                  }
                />
              </div>
            </div>

            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                onClick={() => {
                  setShowContentUploadForm(false);
                }}
                type="button"
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Upload Content
              </button>
              <Loader />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MarketingContent;
