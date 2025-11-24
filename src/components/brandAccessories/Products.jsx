import React from "react";
import { parse } from "date-fns";
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../../store/auth";
import CustomDateRangePicker from "../CustomDateRangePicker";
import AddButton from "../AddButton";
import { IoMdClose } from "react-icons/io";
import DataTable from "react-data-table-component";
import { FiMoreVertical } from "react-icons/fi";
import Loader from "../Loader";
import DownloadCSV from "../DownloadCSV";
import FormatPrice from "../FormatPrice";
import TableFilter from "./tableFilter";

const Products = ({ selectedTable, setSelectedTable }) => {
  const {
    URI,
    setLoading,
    showProduct,
    setShowProduct,
    showProductForm,
    setShowProductForm,
    showStockForm,
    setShowStockForm,
  } = useAuth();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [productId, setProductId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    productName: "",
    gstPercentage: "",
    productDescription: "",
    productSize: "",
    productQuantity: "",
    productPrice: "",
    sellingPrice: "",
    lotNumber: "",
    productImage: "",
  });

  const [newStock, setNewStock] = useState({
    gstPercentage: "",
    productSize: "",
    productQuantity: "",
    productPrice: "",
    sellingPrice: "",
    lotNumber: "",
    productImage: "",
  });

  // For View Product & Stock List
  const [product, setProduct] = useState({});
  const [stockList, setStockList] = useState([]);

  //Image Upload
  const [selectedImage, setSelectedImage] = useState(null);
  const singleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.size <= 1 * 1024 * 1024) {
      setSelectedImage(file);
      setNewProduct((prev) => ({ ...prev, productImage: file }));
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
      const response = await fetch(URI + "/admin/brand-accessories/products", {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch product.");
      const data = await response.json();
      console.log(data);
      setProducts(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // Fetch Product Data
  const fetchProduct = async (id) => {
    try {
      const response = await fetch(
        URI + `/admin/brand-accessories/product/${id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch product.");
      const data = await response.json();

      setProduct(data);
      await fetchStockList(id);
      setShowProduct(true);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  const fetchStockList = async (id) => {
    try {
      const response = await fetch(
        `${URI}/admin/brand-accessories/product/stock/list/${id}`,
        {
          method: "GET",
          credentials: "include", // Ensures cookies are sent
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch Stock List.");
      const data = await response.json();
      //console.log(data);
      setStockList(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //fetch data on form
  const edit = async (id) => {
    try {
      const response = await fetch(
        URI + `/admin/brand-accessories/product/${id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch product.");
      const data = await response.json();

      setNewProduct(data);
      setShowProductForm(true);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  const add = async (e) => {
    e.preventDefault();

    const endpoint = newProduct.productId
      ? `edit/${newProduct.productId}`
      : "add";
    const method = newProduct.productId ? "PUT" : "POST";

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("productName", newProduct.productName);
      formData.append("gstPercentage", newProduct.gstPercentage);
      formData.append("productDescription", newProduct.productDescription);
      formData.append("productSize", newProduct.productSize);
      formData.append("productQuantity", newProduct.productQuantity);
      formData.append("productPrice", newProduct.productPrice);
      formData.append("sellingPrice", newProduct.sellingPrice);
      formData.append("lotNumber", newProduct.lotNumber);

      // Append image if selected
      if (selectedImage) {
        formData.append("productImage", newProduct.productImage);
      }

      const response = await fetch(
        `${URI}/admin/brand-accessories/product/${endpoint}`,
        {
          method: newProduct.productId ? "PUT" : "POST",
          credentials: "include",
          body: formData, // No need for headers, browser sets it
        }
      );

      if (response.status === 409) {
        alert("Product already exists!");
      } else if (!response.ok) {
        throw new Error(`Failed to save product. Status: ${response.status}`);
      } else {
        alert(
          newProduct.productId
            ? "Product updated successfully!"
            : "Product added successfully!"
        );

        setNewProduct({
          productName: "",
          gstPercentage: "",
          productDescription: "",
          productSize: "",
          productQuantity: "",
          productPrice: "",
          sellingPrice: "",
          lotNumber: "",
          productImage: "",
        });

        setShowProductForm(false);
        setSelectedImage(null);
        await fetchData();
      }
    } catch (err) {
      console.error("Error saving product:", err);
    } finally {
      setLoading(false);
    }
  };

  //fetch data on form
  const fetchStock = async (id) => {
    try {
      const response = await fetch(
        URI + `/admin/brand-accessories/product/${id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch product.");
      const data = await response.json();

      setNewStock(data);
      setShowStockForm(true);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  const addStock = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(
        `${URI}/admin/brand-accessories/product/stock/add/${productId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newStock),
        }
      );

      if (response.status === 409) {
        alert("Stock already exists!");
      } else if (!response.ok) {
        throw new Error(`Failed to add Stock. Status: ${response.status}`);
      } else {
        alert("New Stock Added Successfully!");

        setNewStock({
          productName: "",
          gstPercentage: "",
          productDescription: "",
          productSize: "",
          productQuantity: "",
          productPrice: "",
          sellingPrice: "",
          lotNumber: "",
          productImage: "",
        });

        setShowStockForm(false);
        await fetchData();
      }
    } catch (err) {
      console.error("Error adding Stock:", err);
    } finally {
      setLoading(false);
    }
  };

  // Change Status
  const changeStatus = async (id) => {
    if (
      !window.confirm("Are you sure to change this Product Status?")
    )
      return;

    try {
      const response = await fetch(URI + `/admin/brand-accessories/product/status/${id}`, {
        method: "PUT",
        credentials: "include",
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
      console.error("Error in Changing status :", error);
    }
  };

  //Delete record
  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Product?"))
      return;

    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/brand-accessories/product/delete/${id}`,
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
        alert("Product deleted successfully!");
        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting Product:", error);
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

  const filteredData = products?.filter((item) => {
    const matchesSearch = item.productName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    let startDate = range[0].startDate;
    let endDate = range[0].endDate;

    if (startDate) startDate = new Date(startDate.setHours(0, 0, 0, 0));
    if (endDate) endDate = new Date(endDate.setHours(23, 59, 59, 999));

    const itemDate = parse(
      item.productCreatedAt,
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
            {row.productQuantity > 0 ? "In Stock" : "Out of Stock"}
          </div>
        </div>
      ),
      width: "70px",
    },
    {
      name: "Image",
      cell: (row) => {
        let imageSrc =
          URI + row.productImage ||
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c";
        return (
          <div className="w-[110px] h-[62px] overflow-hidden border rounded-lg flex items-center justify-center">
            <img
              src={imageSrc}
              alt="productImage"
              onClick={() => {
                window.open(`${URI}${row.productImage}`, "_blank");
              }}
              className="w-full h-[100%] object-cover cursor-pointer"
            />
          </div>
        );
      },
      width: "150px",
    },
    {
      name: "Date & Time",
      selector: (row) => row.productCreatedAt,
      width: "200px",
    },
    {
      name: "Product Name",
      selector: (row) => row.productName,
      sortable: true,
      minWidth: "180px",
      maxWidth: "200px",
    },
    {
      name: "GST %",
      selector: (row) => row.gstPercentage + "%",
      width: "100px",
    },
    {
      name: "Unit Price",
      selector: (row) => <FormatPrice price={row.productPrice} />,
      minWidth: "150px",
      maxWidth: "200px",
    },
    {
      name: "Selling Price",
      selector: (row) => <FormatPrice price={row.sellingPrice} />,
      minWidth: "150px",
      maxWidth: "200px",
    },
    {
      name: "Quantity",
      selector: (row) => row.totalQuantity + " Units",
      minWidth: "150px",
      maxWidth: "200px",
    },
    {
      name: "Action",
      cell: (row) => <ActionDropdown row={row} />,
      width: "120px",
    },
  ];

  const ActionDropdown = ({ row }) => {
    const [selectedAction, setSelectedAction] = useState("");

    const handleActionSelect = (action, id) => {
      switch (action) {
        case "view":
          fetchProduct(id);
          break;
        case "update":
          setProductId(id);
          edit(id);
          break;
        case "addStock":
          setProductId(id);
          fetchStock(id);
          break;
        case "changeStatus":
          setProductId(id);
          changeStatus(id);
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
            handleActionSelect(action, row.productId);
          }}
        >
          <option value="" disabled>
            Select Action
          </option>
          <option value="view">View</option>
          <option value="update">Update</option>
          <option value="addStock">ADD Stock</option>
          <option value="changeStatus">Change Status</option>
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
          <div className="flex xl:hidden flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
            <DownloadCSV data={filteredData} filename={"Product.csv"} />
            <AddButton label={"Add"} func={setShowProductForm} />
          </div>
        </div>

        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] border rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search Product"
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
              <DownloadCSV data={filteredData} filename={"Product.csv"} />
              <AddButton label={"Add"} func={setShowProductForm} />
            </div>
          </div>
        </div>
        <h2 className="text-[16px] font-semibold">Product List</h2>
        <div className="overflow-scroll scrollbar-hide">
          <DataTable
            className="scrollbar-hide"
            customStyles={customStyles}
            columns={columns}
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
          showProductForm ? "flex" : "hidden"
        } z-[61] sales-form overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] lg:w-[750px] max-h-[75vh] bg-white py-8 pb-10 px-3 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">
              {" "}
              {newProduct.productId ? "Update Product" : "ADD Product"}{" "}
            </h2>

            <IoMdClose
              onClick={() => {
                setShowProductForm(false);
                setNewProduct({
                  productName: "",
                  gstPercentage: "",
                  productDescription: "",
                  productSize: "",
                  productQuantity: "",
                  productPrice: "",
                  sellingPrice: "",
                  lotNumber: "",
                  productImage: "",
                });
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={add}>
            <div className="grid gap-2 lg:gap-3 grid-cols-1 lg:grid-cols-2">
              <input
                type="hidden"
                value={newProduct.productId || ""}
                readOnly
              />

              <div
                className={`${
                  newProduct.productId ? "col-span-2" : "col-span-1"
                } w-full `}
              >
                <label
                  htmlFor="productName"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  Product Name
                </label>
                <input
                  type="text"
                  id="productName"
                  placeholder="Enter Product Name"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProduct?.productName || ""}
                  onChange={(e) => {
                    setNewProduct({
                      ...newProduct,
                      productName: e.target.value,
                    });
                  }}
                />
              </div>

              <div
                className={`${
                  newProduct.productId ? "hidden" : "block"
                } w-full `}
              >
                <label
                  htmlFor="gstPercentage"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  GST Percentage
                </label>
                <input
                  type="number"
                  id="gstPercentage"
                  placeholder="Enter GST Percentage"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProduct?.gstPercentage}
                  onChange={(e) => {
                    setNewProduct({
                      ...newProduct,
                      gstPercentage: e.target.value,
                    });
                  }}
                />
              </div>

              <div className={`col-span-2 w-full`}>
                <label
                  htmlFor="description"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  Product Description
                </label>
                <input
                  type="text"
                  id="discription"
                  placeholder="Enter Product Description"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProduct?.productDescription}
                  onChange={(e) => {
                    setNewProduct({
                      ...newProduct,
                      productDescription: e.target.value,
                    });
                  }}
                />
              </div>

              <div
                className={`${
                  newProduct.productId ? "hidden" : "block"
                } w-full `}
              >
                <label
                  htmlFor="productSize"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  Product Size
                </label>
                <input
                  type="text"
                  id="productSize"
                  placeholder="Enter Size"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProduct?.productSize}
                  onChange={(e) => {
                    setNewProduct({
                      ...newProduct,
                      productSize: e.target.value,
                    });
                  }}
                />
              </div>

              <div
                className={`${
                  newProduct.productId ? "hidden" : "block"
                } w-full `}
              >
                <label
                  htmlFor="productQuantity"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  Quantity
                </label>
                <input
                  type="number"
                  id="productQuantity"
                  placeholder="Enter Quantity"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProduct?.productQuantity}
                  onChange={(e) => {
                    setNewProduct({
                      ...newProduct,
                      productQuantity: e.target.value,
                    });
                  }}
                />
              </div>

              <div
                className={`${
                  newProduct.productId ? "hidden" : "block"
                } w-full `}
              >
                <label
                  htmlFor="productPrice"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  Price per Unit
                </label>
                <input
                  type="number"
                  id="productPrice"
                  placeholder="Enter Price per Unit"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProduct?.productPrice}
                  onChange={(e) => {
                    setNewProduct({
                      ...newProduct,
                      productPrice: e.target.value,
                    });
                  }}
                />
              </div>

              <div
                className={`${
                  newProduct.productId ? "hidden" : "block"
                } w-full `}
              >
                <label
                  htmlFor="sellingPrice"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  Selling Price
                </label>
                <input
                  type="number"
                  id="sellingPrice"
                  placeholder="Enter Selling Price"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProduct?.sellingPrice}
                  onChange={(e) => {
                    setNewProduct({
                      ...newProduct,
                      sellingPrice: e.target.value,
                    });
                  }}
                />
              </div>

              <div
                className={`${
                  newProduct.productId ? "hidden" : "block"
                } w-full `}
              >
                <label
                  htmlFor="lotNumber"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  LOT Number
                </label>
                <input
                  type="text"
                  id="lotNumber"
                  placeholder="Enter LOT Number"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProduct?.lotNumber}
                  onChange={(e) => {
                    setNewProduct({
                      ...newProduct,
                      lotNumber: e.target.value,
                    });
                  }}
                />
              </div>

              <div
                className={`${
                  newProduct.productId ? "col-span-2" : "col-span-1"
                }`}
              >
                <label className="block ml-1 text-sm leading-4 text-[#00000066] font-medium mb-2">
                  Upload Product Image
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
                    <span className="m-3 p-0 text-[16px] font-medium text-[#00000066]">
                      Upload Image
                    </span>
                    <div className="btn flex items-center justify-center w-[107px] p-3 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
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
            </div>
            <div className="flex h-10 mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowProductForm(false);
                  setNewProduct({
                    productName: "",
                    gstPercentage: "",
                    productDescription: "",
                    productSize: "",
                    productQuantity: "",
                    productPrice: "",
                    sellingPrice: "",
                    lotNumber: "",
                    productImage: "",
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
                Save
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>

      {/* ADD Stock Form */}
      <div
        className={`${
          showStockForm ? "flex" : "hidden"
        } z-[61] Stock-form overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] lg:w-[750px] max-h-[75vh] bg-white py-8 pb-10 px-3 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">ADD New Stock </h2>

            <IoMdClose
              onClick={() => {
                setShowStockForm(false);
                setNewStock({
                  gstPercentage: "",
                  productSize: "",
                  productQuantity: "",
                  productPrice: "",
                  sellingPrice: "",
                  lotNumber: "",
                  productImage: "",
                });
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={addStock}>
            <div className="grid gap-2 lg:gap-3 grid-cols-1 lg:grid-cols-2">
              <input type="hidden" value={newStock.stockId || ""} readOnly />

              <div className={`w-full `}>
                <label
                  htmlFor="productName"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  Product Name
                </label>
                <input
                  type="text"
                  id="productName"
                  placeholder="Enter Product Name"
                  disabled
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newStock?.productName || ""}
                  readOnly
                />
              </div>

              <div className={`w-full `}>
                <label
                  htmlFor="gstPercentage"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  GST Percentage
                </label>
                <input
                  type="number"
                  id="gstPercentage"
                  placeholder="Enter GST Percentage"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newStock?.gstPercentage}
                  onChange={(e) => {
                    setNewStock({
                      ...newStock,
                      gstPercentage: e.target.value,
                    });
                  }}
                />
              </div>

              <div className={`w-full `}>
                <label
                  htmlFor="productSize"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  Product Size
                </label>
                <input
                  type="text"
                  id="productSize"
                  placeholder="Enter Size"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newStock?.productSize}
                  onChange={(e) => {
                    setNewStock({
                      ...newStock,
                      productSize: e.target.value,
                    });
                  }}
                />
              </div>

              <div className={`w-full `}>
                <label
                  htmlFor="productQuantity"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  Product Quantity
                </label>
                <input
                  type="number"
                  id="productQuantity"
                  placeholder="Enter Quantity"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newStock?.productQuantity}
                  onChange={(e) => {
                    setNewStock({
                      ...newStock,
                      productQuantity: e.target.value,
                    });
                  }}
                />
              </div>

              <div className={`w-full `}>
                <label
                  htmlFor="productPrice"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  Price per Unit
                </label>
                <input
                  type="number"
                  id="productPrice"
                  placeholder="Enter Price per Unit"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newStock?.productPrice}
                  onChange={(e) => {
                    setNewStock({
                      ...newStock,
                      productPrice: e.target.value,
                    });
                  }}
                />
              </div>

              <div className={`w-full `}>
                <label
                  htmlFor="sellingPrice"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  Selling Price
                </label>
                <input
                  type="number"
                  id="sellingPrice"
                  placeholder="Enter Selling Price"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newStock?.sellingPrice}
                  onChange={(e) => {
                    setNewStock({
                      ...newStock,
                      sellingPrice: e.target.value,
                    });
                  }}
                />
              </div>

              <div className={`w-full `}>
                <label
                  htmlFor="lotNumber"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  LOT Number
                </label>
                <input
                  type="text"
                  id="lotNumber"
                  placeholder="Enter LOT Number"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newStock?.lotNumber}
                  onChange={(e) => {
                    setNewStock({
                      ...newStock,
                      lotNumber: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
            <div className="flex h-10 mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowStockForm(false);
                  setNewStock({
                    gstPercentage: "",
                    productSize: "",
                    productQuantity: "",
                    productPrice: "",
                    sellingPrice: "",
                    lotNumber: "",
                    productImage: "",
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
                ADD Stock
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>

      {/* View Product and Stock List */}
      <div
        className={`${
          showProduct ? "flex" : "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[550px] max-h-[80vh] bg-white py-8 pb-10 px-3 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Product & Stock List</h2>

            <IoMdClose
              onClick={() => {
                setShowProduct(false);
                setProduct({});
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          {/* Product Image and Info */}

          <div className="w-full flex gap-4 items-center">
            <div>
              <img
                src={`${URI}${product?.productImage}`}
                alt="Product"
                className="w-[140px] h-[90px] object-cover rounded-md border"
              />
            </div>

            <div className="w-[250px] flex flex-col space-y-2">
              <h2 className="ml-2 text-base font-semibold text-gray-800">
                {product?.productName || "T-shirts"}
              </h2>

              <p className="bg-gray-100 px-2 py-[2px] text-xs text-gray-700 font-semibold rounded break-words whitespace-pre-wrap">
                {product?.productDescription?.slice(0, 50) +
                  (product?.productDescription?.length > 50 ? "..." : "")}
              </p>
            </div>
          </div>

          {/* Stock List View */}
          <div className="w-full flex items-center justify-between">
            <h1 className="my-3 text-base font-semibold ">Stock List</h1>
            <h1 className="my-3 text-base font-semibold ">{product?.totalQuantity + " Units"}</h1>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {stockList?.length > 0 ? (
              stockList?.map((stock) => (
                <div className="w-full p-3 border rounded-xl bg-white shadow-sm space-y-2">
                  <div className="w-full flex items-center justify-start gap-2 px-4 py-1 border rounded-md">
                    <h2 className="text-sm font-semibold ">LOT Number : </h2>
                    <span className="bg-[#EAFBF1] text-[#0BB501] text-[12px] font-semibold px-1 py-0.5 rounded">
                      {stock?.lotNumber}
                    </span>
                  </div>

                  <div className="w-full flex">
                    <span className="bg-gray-100 text-gray-700 text-[12px] font-semibold px-3 py-0.5 rounded">
                      {stock?.created_at}
                    </span>
                  </div>

                  {/* Stock Details */}
                  <div className="grid p-2 grid-cols-2 md:grid-cols-3 gap-4 text-sm font-semibold text-gray-700">
                    <div>
                      <p className="font-medium text-xs text-gray-400">
                        Product Quantity
                      </p>
                      <p className="font-semibold ">
                        {stock?.productQuantity || 0} Units
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-xs text-gray-400">
                        GST Percentage
                      </p>
                      <p className="font-semibold ">
                        {stock?.gstPercentage + "%"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-xs text-gray-400">
                        Product Size
                      </p>
                      <p className="font-semibold ">
                        {stock?.productSize || "No-Size"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-xs text-gray-400">
                        Buying Price
                      </p>
                      <p className="font-semibold ">
                        <FormatPrice price={parseInt(stock?.productPrice)} />
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-xs text-gray-400">
                        Selling Price
                      </p>
                      <p className="font-semibold ">
                        <FormatPrice price={parseInt(stock?.sellingPrice)} />
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="font-semibold">{"Stock Not Found"}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
