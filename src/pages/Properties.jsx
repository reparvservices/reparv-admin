import React from "react";
import { parse } from "date-fns";
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import FilterData from "../components/FilterData";
import AddButton from "../components/AddButton";
import { MdDelete } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { FaFire } from "react-icons/fa6";
import DataTable from "react-data-table-component";
import { FiMoreVertical } from "react-icons/fi";
import Loader from "../components/Loader";
import { RiArrowDropDownLine } from "react-icons/ri";
import MultiStepForm from "../components/propertyForm/MultiStepForm";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import propertyPicture from "../assets/propertyPicture.svg";
import DownloadCSV from "../components/DownloadCSV";
import UpdateImagesForm from "../components/propertyForm/UpdateImagesForm";
import PropertyFilter from "../components/propertyFilter";
import FormatPrice from "../components/FormatPrice";
import PropertyCommissionPopup from "../components/PropertyCommissionPopup";
import Select from "react-select";
import { getImageURI } from "../utils/helper";

const Properties = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    setShowPropertyForm,
    showPropertyForm,
    showUpdateImagesForm,
    setShowUpdateImagesForm,
    showAdditionalInfoForm,
    setShowAdditionalInfoForm,
    showNewPlotAdditionalInfoForm,
    setShowNewPlotAdditionalInfoForm,
    propertyFilter,
    setPropertyFilter,
    showRejectReasonForm,
    setShowRejectReasonForm,
    showSeoForm,
    setShowSeoForm,
    showCommissionForm,
    setShowCommissionForm,
    showVideoUploadForm,
    setShowVideoUploadForm,
    showPropertyLocationForm,
    setShowPropertyLocationForm,
    propertyCommissionData,
    setPropertyCommissionData,
    showPropertyCommissionPopup,
    setShowPropertyCommissionPopup,
    showChangeProjectPartnerForm,
    setShowChangeProjectPartnerForm,
    showTopPicksForm,
    setShowTopPicksForm,
    URI,
    loading,
    setLoading,
  } = useAuth();
  //const ImageURI = import.meta.env.VITE_S3_IMAGE_URL;

  const [datas, setDatas] = useState([]);
  const [propertyTypeData, setPropertyTypeData] = useState([]);
  const [propertyType, setPropertyType] = useState("");
  const [property, setProperty] = useState({});
  const [propertyKey, setPropertyKey] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [authorities, setAuthorities] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [builderData, setBuilderData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyImages, setPropertyImages] = useState([]);
  const [file, setFile] = useState(null);
  const [newAddInfo, setNewAddInfo] = useState({
    propertyid: "",
  });

  // Property Location Latitude & Longitude
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [seoActive, setSeoActive] = useState(false);
  const [seoSlug, setSeoSlug] = useState("");
  const [seoTittle, setSeoTittle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [propertyDescription, setPropertyDescription] = useState("");
  const [newProperty, setPropertyData] = useState({
    builderid: "",
    projectBy: "",
    possessionDate: "",
    propertyCategory: "",
    propertyApprovedBy: "",
    propertyName: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
    location: "",
    distanceFromCityCenter: "",
    latitude: "",
    longitude: "",
    totalSalesPrice: "",
    totalOfferPrice: "",
    stampDuty: "",
    registrationFee: "",
    gst: "",
    advocateFee: "",
    msebWater: "",
    maintenance: "",
    other: "",
    tags: "",
    propertyType: "",
    builtYear: "",
    ownershipType: "",
    builtUpArea: "",
    carpetArea: "",
    parkingAvailability: "",
    totalFloors: "",
    floorNo: "",
    loanAvailability: "",
    propertyFacing: "",
    reraRegistered: "",
    furnishing: "",
    waterSupply: "",
    powerBackup: "",
    locationFeature: "",
    sizeAreaFeature: "",
    parkingFeature: "",
    terraceFeature: "",
    ageOfPropertyFeature: "",
    amenitiesFeature: "",
    propertyStatusFeature: "",
    smartHomeFeature: "",
    securityBenefit: "",
    primeLocationBenefit: "",
    rentalIncomeBenefit: "",
    qualityBenefit: "",
    capitalAppreciationBenefit: "",
    ecofriendlyBenefit: "",
  });

  const [projectPartnerList, setProjectPartnerList] = useState([]);
  const [projectPartnerChange, setProjectPartnerChange] = useState({
    projectPartnerId: "",
    projectPartner: "",
    projectPartnerContact: "",
    state: "",
    city: "",
  });

  // For Update images
  const [propertyImageData, setPropertyImageData] = useState({});
  const [imageFiles, setImageFiles] = useState({
    frontView: [],
    sideView: [],
    kitchenView: [],
    hallView: [],
    bedroomView: [],
    bathroomView: [],
    balconyView: [],
    nearestLandmark: [],
    developedAmenities: [],
  });

  const [selectedPartner, setSelectedPartner] = useState(
    "Select Property Lister",
  );

  const [propertyCommission, setPropertyCommission] = useState({
    commissionType: "",
    commissionAmount: "",
    commissionPercentage: "",
    commissionAmountPerSquareFeet: "",
  });

  const additionalInfoCSVFileFormat = [
    {
      Mouza: "Nagpur",
      Khasra_No: "123/ABC",
      Wing: "A",
      Wing_Facing: "East",
      Floor_No: "3",
      Flat_No: "101",
      Flat_Facing: "East",
      BHK_Type: "2 BHK",
      Carpet_Area: 2200,
      Builtup_Area: 1800,
      Super_Builtup_Area: 1800,
      Additional_Area: 100,
      Payable_Area: 2000,
      SQFT_Price: 10000,
      Basic_Cost: "=M2*N2",
      Stamp_Duty: 10000,
      Registration: 30000,
      GST: 500000,
      GOV_Water_Charge: 10000,
      Maintenance: 50000,
      Advocate_Fee: 20000,
      Other_Charges: 50000,
      Total_Cost: "=O2+P2+Q2+R2+S2+T2+U2+V2",
    },
  ];

  const additionalInfoNewPlotCSVFileFormat = [
    {
      Mouza: "Nagpur",
      Khasra_No: "123/ABC",
      Plot_No: "3",
      Facing: "East",
      Plot_Size: "20 X 30",
      Plot_Area: 2200,
      SQFT_Price: 1000,
      Basic_Cost: 2200 * 1000,
      Stamp_Duty: 10000,
      Registration: 30000,
      GST: 500000,
      Maintenance: 50000,
      Advocate_Fee: 20000,
      Other_Charges: 50000,
      Total_Cost: 2200000 + 10000 + 30000 + 50000 + 50000 + 20000 + 50000,
    },
  ];

  // for Uploade Brochure and Video
  const [videoUpload, setVideoUpload] = useState({
    brochureFile: "",
    videoLink: "",
  });

  const [topPicks, setTopPicks] = useState({
    topPicksStatus: "",
    topPicksBanner: "",
  });

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

  //Single Image Upload
  const [selectedScheduledPropertyImage, setSelectedScheduledPropertyImage] =
    useState(null);

  const scheduledPropertyImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedScheduledPropertyImage(file);
    }
  };

  const removeScheduledPropertyImage = () => {
    setSelectedScheduledPropertyImage(null);
  };

  //Single Image Upload
  const [selectedSignedDocumentImage, setSelectedSignedDocumentImage] =
    useState(null);

  const signedDocumentImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedSignedDocumentImage(file);
    }
  };

  const removeSignedDocumentImage = () => {
    setSelectedSignedDocumentImage(null);
  };

  //Single Image Upload
  const [selectedSatBaraImage, setSelectedSatBaraImage] = useState(null);

  const satBaraImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedSatBaraImage(file);
    }
  };

  const removeSatBaraImage = () => {
    setSelectedSatBaraImage(null);
  };

  //Single Image Upload
  const [selectedOwnerAdharImage, setSelectedOwnerAdharImage] = useState(null);

  const ownerAdharImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedOwnerAdharImage(file);
    }
  };

  const removeOwnerAdharImage = () => {
    setSelectedOwnerAdharImage(null);
  };

  //Single Image Upload
  const [selectedOwnerPanImage, setSelectedOwnerPanImage] = useState(null);

  const ownerPanImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedOwnerPanImage(file);
    }
  };

  const removeOwnerPanImage = () => {
    setSelectedOwnerPanImage(null);
  };

  //Single Image Upload
  const [selectedEBillImage, setSelectedEBillImage] = useState(null);

  const eBillImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedEBillImage(file);
    }
  };

  const removeEBillImage = () => {
    setSelectedEBillImage(null);
  };

  // **Fetch Authorities from API**
  const fetchAuthorities = async () => {
    try {
      const response = await fetch(URI + "/admin/authorities", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Authorities.");
      const data = await response.json();
      setAuthorities(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
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
        `${URI}/admin/cities/${newProperty?.state}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch cities.");
      const data = await response.json();
      //console.log(data);
      setCities(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //Fetch Builder
  const fetchBuilder = async () => {
    try {
      const response = await fetch(URI + "/admin/builders/active", {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch builders.");
      const data = await response.json();
      setBuilderData(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  /*Fetch Property type
  const fetchPropertyType = async () => {
    try {
      const response = await fetch(URI + "/admin/propertytypes/active", {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch properties.");
      const data = await response.json();
      setPropertyTypeData(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };
  */

  //Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${URI}/admin/properties/get/${selectedPartner}`,
        {
          method: "GET",
          credentials: "include", //  Ensures cookies are sent
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch properties.");
      const data = await response.json();
      setDatas(data);
    } catch (err) {
      console.error("Error fetching :", err);
    } finally {
      setLoading(false);
    }
  };

  //fetch data on form
  const edit = async (id) => {
    try {
      const response = await fetch(URI + `/admin/properties/${id}`, {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch property.");
      const data = await response.json();
      setPropertyData(data);
      console.log(data);
      setShowPropertyForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // Delete record
  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?"))
      return;

    try {
      const response = await fetch(URI + `/admin/properties/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        alert("Property deleted successfully!");
        // Refresh employee list
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
    if (
      !window.confirm("Are you sure you want to change this property status?")
    )
      return;

    try {
      const response = await fetch(URI + `/admin/properties/status/${id}`, {
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

  // change status record
  const approve = async (id) => {
    if (!window.confirm("Are you sure you want to approve this property?")) {
      return;
    }

    try {
      const response = await fetch(URI + `/admin/properties/approve/${id}`, {
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

  // change property into hot deal
  const hotDeal = async (id) => {
    if (!window.confirm("Are you sure to change hot Deal status?")) {
      return;
    }

    try {
      const response = await fetch(
        URI + `/admin/properties/set/hotdeal/${id}`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      const data = await response.json();
      //console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      fetchData();
    } catch (error) {
      console.error("Error hot Dealingg :", error);
    }
  };

  //fetch data on form
  const fetchPropertyLocation = async (id) => {
    try {
      const response = await fetch(
        URI + `/admin/properties/location/get/${id}`,
        {
          method: "GET",
          credentials: "include", // Ensures cookies are sent
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch property location.");
      const data = await response.json();
      setLatitude(data.latitude);
      setLongitude(data.longitude);
      setShowPropertyLocationForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // change property into hot deal
  const reparvAssured = async (id) => {
    if (!window.confirm("Are you sure to change Reparv Assured status ?")) {
      return;
    }

    try {
      const response = await fetch(
        URI + `/admin/properties/reparv-assured/${id}`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      const data = await response.json();
      //console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      fetchData();
    } catch (error) {
      console.error("Error Reparv Assured :", error);
    }
  };

  // Update Property Loaction Latitude and Longitude
  const updatePropertyLocation = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/properties/location/edit/${propertyKey}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude,
            longitude,
          }),
        },
      );
      const data = await response.json();
      //console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      setShowPropertyLocationForm(false);
      setLatitude("");
      setLongitude("");
      await fetchData();
    } catch (error) {
      console.error("Error adding property Location:", error);
    } finally {
      setLoading(false);
    }
  };

  //fetch Brochure and Video Data From Property
  const showBrochure = async (id) => {
    try {
      const response = await fetch(URI + `/admin/properties/${id}`, {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch property.");
      const data = await response.json();
      setVideoUpload({
        ...videoUpload,
        brochureFile: data.brochureFile,
        videoLink: data.videoLink,
      });
      console.log(data);
      setShowVideoUploadForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  const uploadVideo = async (e) => {
    e.preventDefault();

    // === Validation ===
    if (!selectedImage && !videoUpload?.videoLink) {
      alert(
        "Please select a brochure image/PDF or enter a YouTube video link.",
      );
      return;
    }

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    const maxFileSize = 300 * 1024 * 1024; // 300 MB

    // Validate brochure file
    if (selectedImage) {
      if (!allowedImageTypes.includes(selectedImage.type)) {
        alert("Only JPG, PNG, WEBP, or PDF files are allowed for brochure.");
        return;
      }
      if (selectedImage.size > maxFileSize) {
        alert("Brochure file size must be less than 300MB.");
        return;
      }
    }

    // Validate YouTube link (optional but ensures correctness)
    if (videoUpload?.videoLink) {
      const isYouTubeURL =
        videoUpload.videoLink.includes("youtube.com") ||
        videoUpload.videoLink.includes("youtu.be");
      if (!isYouTubeURL) {
        alert("Please enter a valid YouTube video link.");
        return;
      }
    }

    const formData = new FormData();

    if (selectedImage) formData.append("brochureFile", selectedImage);
    if (videoUpload?.videoLink)
      formData.append("videoLink", videoUpload.videoLink);

    try {
      setLoading(true);

      const response = await fetch(
        `${URI}/admin/properties/brochure/upload/${propertyKey}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        },
      );

      const data = await response.json();

      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }

      // Reset states
      setShowVideoUploadForm(false);
      setSelectedImage(null);
      setVideoUpload({ videoLink: "" });
      await fetchData();
    } catch (error) {
      console.error("Error uploading brochure or video link:", error);
      alert("Something went wrong while uploading. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  //fetch data on form
  const showSEO = async (id) => {
    try {
      const response = await fetch(URI + `/admin/properties/${id}`, {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch property.");
      const data = await response.json();
      setSeoSlug(data.seoSlug);
      setSeoTittle(data.seoTittle);
      setSeoDescription(data.seoDescription);
      setPropertyDescription(data.propertyDescription);
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
      const response = await fetch(
        URI + `/admin/properties/seo/${propertyKey}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seoSlug,
            seoTittle,
            seoDescription,
            propertyDescription,
          }),
        },
      );
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
      setPropertyDescription("");
      await fetchData();
    } catch (error) {
      console.error("Error adding Seo Details reason:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add Property Reject Reason
  const addRejectReason = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/properties/reject/${propertyKey}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rejectReason }),
        },
      );
      const data = await response.json();
      console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      setShowRejectReasonForm(false);
      setRejectReason("");
      await fetchData();
    } catch (error) {
      console.error("Error adding reject reason:", error);
    } finally {
      setLoading(false);
    }
  };

  //Property Image Uploader
  const [images, setImages] = useState([]);
  const [propertyId, setPropertyId] = useState(null);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  //fetch data on form
  const fetchImages = async (id) => {
    try {
      const response = await fetch(URI + `/admin/properties/${id}`, {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch property.");
      const data = await response.json();
      setPropertyImageData(data);
      //console.log(data);
      setShowUpdateImagesForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  const addImages = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("propertyid", propertyId);
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append("images[]", image);
      });
    }

    try {
      setLoading(true);
      const response = await fetch(`${URI}/admin/properties/addimages`, {
        method: "POST",
        credentials: "include",
        body: formData, // FormData allows file uploads
      });

      if (response.status === 409) {
        alert("Property already exists!");
      } else if (!response.ok) {
        throw new Error(`Failed to save property. Status: ${response.status}`);
      } else {
        setLoading(false);
        alert("Images Uploaded Successfully!");
      }

      // Reset after upload
      setImages([]);
      setShowUpdateImagesForm(false);
      await fetchData(); // Refresh data
    } catch (err) {
      console.error("Error saving property:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add Additional Info as a CSV File for New Flat
  const addCsv = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("propertyid", propertyKey);
    formData.append("csv", file);

    try {
      const response = await fetch(
        `${URI}/admin/properties/additionalinfo/flat/csv/add/${propertyKey}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      const data = await response.json();
      if (!response.ok) {
        console.error("Server responded with an error:", data);
        alert(data.message || "CSV upload failed due to a server error.");
        return;
      }

      alert(data.message || "CSV uploaded successfully.");
      setShowAdditionalInfoForm(false);
      setFile(null); // Clear selected file
    } catch (error) {
      console.error("Upload error:", error);
      alert("An unexpected error occurred while uploading the CSV file.");
    }
  };

  // Add Additional Info as a CSV File for New Plot
  const addCsvForNewPlot = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("propertyid", propertyKey);
    formData.append("csv", file);

    try {
      const response = await fetch(
        `${URI}/admin/properties/additionalinfo/plot/csv/add/${propertyKey}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      const data = await response.json();
      if (!response.ok) {
        console.error("Server responded with an error:", data);
        alert(data.message || "CSV upload failed due to a server error.");
        return;
      }

      alert(data.message || "CSV uploaded successfully.");
      setShowNewPlotAdditionalInfoForm(false);
      setFile(null); // Clear selected file
    } catch (error) {
      console.error("Upload error:", error);
      alert("An unexpected error occurred while uploading the CSV file.");
    }
  };

  const additionalInfo = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("propertyid", newAddInfo.propertyid);
    formData.append("wing", newAddInfo.wing);
    formData.append("floor", newAddInfo.floor);
    formData.append("flatno", newAddInfo.flatno);
    formData.append("direction", newAddInfo.direction);
    formData.append("ageofconstruction", newAddInfo.ageofconstruction);
    formData.append("carpetarea", newAddInfo.carpetarea);
    formData.append("superbuiltup", newAddInfo.superbuiltup);
    formData.append("salesprice", newAddInfo.salesprice);
    formData.append("description", newAddInfo.description);
    formData.append("ownercontact", newAddInfo.ownercontact);

    if (selectedOwnerAdharImage) {
      formData.append("owneradhar", selectedOwnerAdharImage);
    }
    if (selectedOwnerPanImage) {
      formData.append("ownerpan", selectedOwnerPanImage);
    }
    if (selectedScheduledPropertyImage) {
      formData.append("schedule", selectedScheduledPropertyImage);
    }
    if (selectedSignedDocumentImage) {
      formData.append("signed", selectedSignedDocumentImage);
    }
    if (selectedSatBaraImage) {
      formData.append("satbara", selectedSatBaraImage);
    }
    if (selectedEBillImage) {
      formData.append("ebill", selectedEBillImage);
    }

    const endpoint = newAddInfo.propertyinfoid
      ? `editadditionalinfo/${newAddInfo.propertyinfoid}`
      : "additionalinfoadd";

    try {
      setLoading(true);
      const response = await fetch(`${URI}/admin/properties/${endpoint}`, {
        method: newAddInfo.propertyinfoid ? "PUT" : "POST",
        credentials: "include",
        body: formData,
      });

      if (response.status === 409) {
        alert("Additional Info already exists!");
      } else if (!response.ok) {
        throw new Error(
          `Failed to save Additional Info. Status: ${response.status}`,
        );
      } else {
        alert(
          newAddInfo.propertyinfoid
            ? "Additional Info updated successfully!"
            : "Additional Info added successfully!",
        );
      }
      // Clear form only after a successful response
      setNewAddInfo({
        propertyid: "",
        wing: "",
        floor: "",
        flatno: "",
        direction: "",
        ageofconstruction: "",
        carpetarea: "",
        superbuiltup: "",
        salesprice: "",
        description: "",
        ownercontact: "",
      });

      setShowAdditionalInfoForm(false);

      await fetchData();
    } catch (err) {
      console.error("Error saving property:", err);
    } finally {
      setLoading(false);
    }
  };

  //fetch data on form
  const showPropertyCommission = async (id) => {
    try {
      const response = await fetch(URI + `/admin/properties/${id}`, {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch property.");
      const data = await response.json();
      setPropertyCommission({
        ...propertyCommission,
        commissionType: data.commissionType || "",
        commissionAmount: data.commissionAmount || "",
        commissionPercentage: data.commissionPercentage || "",
        commissionAmountPerSquareFeet: data.commissionAmountPerSquareFeet || "",
      });
      setShowCommissionForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // Set Commission Type
  const addPropertyCommission = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/properties/commission/${propertyKey}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(propertyCommission),
        },
      );
      const data = await response.json();
      console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      setShowCommissionForm(false);
      setPropertyCommission({
        ...propertyCommission,
        commissionType: "",
        commissionAmount: "",
        commissionPercentage: "",
        commissionAmountPerSquareFeet: "",
      });
      await fetchData();
    } catch (error) {
      console.error("Error adding property commission reason:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Top Picks data
  const showTopPicks = async (id) => {
    try {
      const response = await fetch(URI + `/admin/properties/${id}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch top picks");

      const data = await response.json();

      setTopPicks({
        topPicksStatus: data.topPicksStatus || "",
        topPicksBanner: data.topPicksBanner || "",
      });

      setPropertyKey(id);
      setShowTopPicksForm(true);
    } catch (err) {
      console.error("Error fetching top picks:", err);
    }
  };

  const addTopPicks = async (e) => {
    e?.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("topPicksStatus", topPicks.topPicksStatus);
      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

      if (topPicks.topPicksBanner instanceof File) {
        if (topPicks.topPicksBanner.size > MAX_FILE_SIZE) {
          alert("Image size must be less than 2MB");
          return;
        }

        formData.append("topPicksBanner", topPicks.topPicksBanner);
      }

      const response = await fetch(
        URI + `/admin/properties/set/top-picks/${propertyKey}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        },
      );

      const data = await response.json();

      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }

      setShowTopPicksForm(false);
      setTopPicks({
        topPicksStatus: "",
        topPicksBanner: "",
      });

      await fetchData();
    } catch (error) {
      console.error("Error adding top picks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete Brochure
  const deleteBrochure = async () => {
    if (!window.confirm("Are you sure to delete Brochure File!")) return;

    try {
      const response = await fetch(
        URI + `/admin/properties/brochure/delete/${propertyKey}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();
      if (response.ok) {
        alert("Property brochure deleted successfully!");
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

  //Fetch Project Partner List
  const fetchProjectPartnerList = async () => {
    try {
      const response = await fetch(URI + "/admin/projectpartner/active", {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Project Partner.");
      const data = await response.json();
      setProjectPartnerList(data);
      //console.log(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  const changeProjectPartner = async (e) => {
    e.preventDefault();
    if (
      !window.confirm(
        "Are you sure to Assign Property to " +
          projectPartnerChange.projectPartner,
      )
    )
      return;

    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/properties/assign/to/project-partner/${propertyKey}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(projectPartnerChange),
        },
      );
      const data = await response.json();
      console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      setProjectPartnerChange({
        projectPartnerId: "",
        projectPartner: "",
        projectPartnerContact: "",
      });
      setShowChangeProjectPartnerForm(false);
      fetchData();
    } catch (error) {
      console.error("Error deleting :", error);
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
      maxHeight: "160px", // Default is ~160px — increase as needed
      paddingTop: 0,
      paddingBottom: 0,
    }),
  };

  useEffect(() => {
    fetchData();
  }, [selectedPartner]);

  useEffect(() => {
    fetchData();
    fetchStates();
    fetchBuilder();
    fetchAuthorities();
    fetchProjectPartnerList();
  }, []);

  useEffect(() => {
    if (newProperty.state != "") {
      fetchCities();
    }
  }, [newProperty.state]);

  const getPropertyCounts = (data) => {
    return data.reduce(
      (acc, item) => {
        if (item.approve === "Approved") {
          acc.Approved++;
        } else if (item.approve === "Not Approved") {
          acc.NotApproved++;
        } else if (item.approve === "Rejected") {
          acc.Rejected++;
        }
        return acc;
      },
      { Approved: 0, NotApproved: 0, Rejected: 0 },
    );
  };

  const propertyCounts = getPropertyCounts(datas);

  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  const filteredData = datas.filter((item) => {
    const lowerSearchTerm = searchTerm?.toLowerCase() || "";

    /* Text search filter */
    const matchesSearch =
      !lowerSearchTerm ||
      item.propertyName?.toLowerCase().includes(lowerSearchTerm) ||
      item.company_name?.toLowerCase().includes(lowerSearchTerm) ||
      item.propertyCategory?.toLowerCase().includes(lowerSearchTerm) ||
      item.state?.toLowerCase().includes(lowerSearchTerm) ||
      item.city?.toLowerCase().includes(lowerSearchTerm) ||
      item.approve?.toLowerCase().includes(lowerSearchTerm) ||
      item.status?.toLowerCase().includes(lowerSearchTerm);

    /* Date range filter */
    let startDate = range?.[0]?.startDate;
    let endDate = range?.[0]?.endDate;

    if (startDate)
      startDate = new Date(new Date(startDate).setHours(0, 0, 0, 0));
    if (endDate)
      endDate = new Date(new Date(endDate).setHours(23, 59, 59, 999));

    const itemDate = item.created_at
      ? parse(item.created_at, "dd MMM yyyy | hh:mm a", new Date())
      : null;

    const matchesDate =
      (!startDate && !endDate) ||
      (itemDate &&
        startDate &&
        endDate &&
        itemDate >= startDate &&
        itemDate <= endDate);

    /* Property approval filter */
    const getPropertyApprovedStatus = () => {
      switch (item.approve) {
        case "Approved":
          return "Approved";
        case "Not Approved":
          return "Not Approved";
        case "Rejected":
          return "Rejected";
        default:
          return "";
      }
    };

    const matchesProperty =
      !propertyFilter || getPropertyApprovedStatus() === propertyFilter;

    /* SEO filter */
    const isSeoMissing =
      !item.seoSlug?.trim() ||
      !item.seoTittle?.trim() ||
      !item.seoDescription?.trim() ||
      !item.propertyDescription?.trim();

    const matchesSeo = seoActive ? isSeoMissing : true;

    /* Final decision */
    return matchesSearch && matchesDate && matchesProperty && matchesSeo;
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
      name: "Image",
      cell: (row) => {
        let imageSrc = propertyPicture;

        try {
          const parsed = JSON.parse(row.frontView);
          if (Array.isArray(parsed) && parsed[0]) {
            imageSrc = `${getImageURI(parsed[0])}`;
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
      name: "Property Name",
      cell: (row, index) => (
        <div className="relative group flex items-center w-full">
          {/* Property Name */}
          <span
            onClick={async () => {
              await setPropertyCommissionData(row);
              setShowPropertyCommissionPopup(true);
            }}
            className={`min-w-6 flex items-center justify-center px-2 py-1 rounded-md cursor-pointer`}
          >
            {row.hotDeal === "Active" && (
              <FaFire className="text-red-600 mr-1" />
            )}{" "}
            {row.propertyName}
          </span>
        </div>
      ),
      sortable: true,
      minWidth: "200px",
    },
    {
      name: "Top Picks",
      cell: (row) => (
        <span
          onClick={() => {
            setPropertyKey(row.propertyid);
            showTopPicks(row.propertyid);
          }}
          className={`px-2 py-1 rounded-md cursor-pointer ${
            row.topPicksStatus === "Active"
              ? "bg-[#EAFBF1] text-[#0BB501]"
              : "bg-gray-100"
          }`}
        >
          {row.topPicksStatus}
        </span>
      ),
      minWidth: "150px",
    },
    {
      name: "Offer Price",
      selector: (row) => <FormatPrice price={parseInt(row.totalOfferPrice)} />,
      width: "150px",
    },
    {
      name: "Builder",
      selector: (row) => row.company_name,
      minWidth: "150px",
    },
    {
      name: "Property Lister",
      cell: (row) => (
        <div className="flex flex-col gap-[2px]">
          <span>{row.fullname}</span>
          <span> {row.contact}</span>
          <span> {row.partnerCity}</span>
        </div>
      ),
      omit: false,
      minWidth: "180px",
    },
    {
      name: "Category",
      selector: (row) => row.propertyCategory,
      width: "150px",
    },
    {
      name: "City",
      selector: (row) => row.city,
      width: "150px",
    },
    {
      name: "Approve",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-md ${
            row.approve === "Approved"
              ? "bg-[#EAFBF1] text-[#0BB501]"
              : row.approve === "Rejected"
                ? "bg-[#FBE9E9] text-[#FF0000]"
                : "bg-[#E9F2FF] text-[#0068FF]"
          }`}
        >
          {row.approve}
        </span>
      ),
      minWidth: "150px",
    },
    {
      name: "Reparv Assured",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-md ${
            row.reparvAssured === "Active"
              ? "bg-[#EAFBF1] text-[#0BB501]"
              : "bg-gray-100"
          }`}
        >
          {row.reparvAssured === "Active" ? "Assured" : "Not Assured"}
        </span>
      ),
      minWidth: "150px",
    },
    {
      name: "Reject Reason",
      selector: (row) => row.rejectreason || "-- No Reason --",
      minWidth: "150px",
    },
    {
      name: "Actions",
      cell: (row) => <ActionDropdown row={row} />,
      width: "120px",
    },
  ];

  const hasPropertyLister = datas.some((row) => !!row.fullname);

  const finalColumns = columns.map((col) => {
    if (col.name === "Property Lister")
      return { ...col, omit: !hasPropertyLister };
    return col;
  });

  const ActionDropdown = ({ row }) => {
    const [selectedAction, setSelectedAction] = useState("");

    const handleActionSelect = (action, propertyid, slug) => {
      switch (action) {
        case "view":
          window.open("https://www.reparv.in/property-info/" + slug, "_blank");
          break;
        case "status":
          status(propertyid);
          break;
        case "hotdeal":
          hotDeal(propertyid);
          break;
        case "topPicks":
          setPropertyKey(propertyid);
          showTopPicks(propertyid);
          break;
        case "reparvAssured":
          reparvAssured(propertyid);
        case "update":
          edit(propertyid);
          break;
        case "delete":
          del(propertyid);
          break;
        case "approve":
          approve(propertyid);
          break;
        case "updateLocation":
          setPropertyKey(propertyid);
          fetchPropertyLocation(propertyid);
          break;
        case "videoUpload":
          setPropertyKey(propertyid);
          showBrochure(propertyid);
          break;
        case "SEO":
          setPropertyKey(propertyid);
          showSEO(propertyid);
          break;
        case "rejectReason":
          setPropertyKey(propertyid);
          setShowRejectReasonForm(true);
          break;
        case "setCommission":
          setPropertyKey(propertyid);
          showPropertyCommission(propertyid);
          break;
        case "gotoadditionalinfo":
          navigate("/property/additional-info/" + propertyid);
          break;
        case "additionalinfo":
          setPropertyKey(propertyid);
          setShowAdditionalInfoForm(true);
          break;
        case "additionalinfoforplot":
          setPropertyKey(propertyid);
          setShowNewPlotAdditionalInfoForm(true);
          break;
        case "updateImages":
          setPropertyKey(propertyid);
          fetchImages(propertyid);
          break;
        case "changeProjectPartner":
          setPropertyKey(propertyid);
          setShowChangeProjectPartnerForm(true);
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
            handleActionSelect(action, row.propertyid, row.seoSlug);
          }}
        >
          <option value="" disabled>
            Select Action
          </option>
          <option value="view">View</option>
          <option value="status">Status</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="approve">Approve</option>
          <option value="hotdeal">Set Hot Deal</option>
          <option value="topPicks">Set Top Picks</option>
          <option value="reparvAssured">Reparv Assured</option>

          {row.propertyCategory === "NewFlat" ||
          row.propertyCategory === "CommercialFlat" ? (
            <option value="additionalinfo">Additional Info</option>
          ) : (
            <></>
          )}
          {row.propertyCategory === "NewPlot" ||
          row.propertyCategory === "CommercialPlot" ? (
            <option value="additionalinfoforplot">Additional Info</option>
          ) : (
            <></>
          )}

          {["NewFlat", "NewPlot", "CommercialFlat", "CommercialPlot"].includes(
            row.propertyCategory,
          ) ? (
            <option value="gotoadditionalinfo">View Additional Info</option>
          ) : (
            <></>
          )}
          <option value="SEO">SEO Details</option>
          <option value="rejectReason">Reject Reason</option>
          <option value="updateImages">Update Images</option>
          <option value="setCommission">Set Commission</option>
          <option value="videoUpload">Brochure & Video</option>
          <option value="updateLocation">Latitude & Longitude</option>
          <option value="changeProjectPartner">Change Project Partner</option>
        </select>
      </div>
    );
  };

  return (
    <div className="properties overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start">
      <div className="properties-table w-full h-[80vh] flex flex-col p-4 md:p-6 gap-4 my-[10px] bg-white md:rounded-[24px]">
        <div className="w-full flex items-center justify-between gap-1 sm:gap-3">
          <div className="w-[65%] sm:min-w-[220px] sm:max-w-[230px] relative inline-block">
            <div className="flex gap-2 items-center justify-between bg-white border border-[#00000033] text-sm font-semibold  text-black rounded-lg py-1 px-3 focus:outline-none focus:ring-2 focus:ring-[#076300]">
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
              <option value="Select Property Lister">
                Select Property Lister
              </option>
              <option value="Reparv Employee">Reparv Employee</option>
              <option value="Project Partner">Project Partner</option>
              <option value="Onboarding Partner">Onboarding Partner</option>
              <option value="Guest User">Guest User</option>
            </select>
          </div>
          <div className="flex xl:hidden flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
            <DownloadCSV data={filteredData} filename={"Properties.csv"} />
            <AddButton label={"Add "} func={setShowPropertyForm} />
          </div>
        </div>
        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search Property"
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
              <DownloadCSV data={filteredData} filename={"Properties.csv"} />
              <AddButton label={"Add "} func={setShowPropertyForm} />
            </div>
          </div>
        </div>
        <div className="filterContainer w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <PropertyFilter counts={propertyCounts} />
        </div>
        <h2 className="text-[16px] font-semibold">Properties List</h2>
        <div className="overflow-scroll scrollbar-hide">
          <DataTable
            className="scrollbar-hide"
            customStyles={customStyles}
            columns={finalColumns}
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

      {/* Add Property Multi Step Form */}
      <MultiStepForm
        fetchData={fetchData}
        newProperty={newProperty}
        setPropertyData={setPropertyData}
        imageFiles={imageFiles}
        setImageFiles={setImageFiles}
        builderData={builderData}
        authorities={authorities}
        states={states}
        cities={cities}
      />

      {/* Upload Images Form */}
      <UpdateImagesForm
        fetchData={fetchData}
        fetchImages={fetchImages}
        propertyId={propertyKey}
        setPropertyId={setPropertyKey}
        newProperty={propertyImageData}
        setPropertyData={setPropertyImageData}
        imageFiles={imageFiles}
        setImageFiles={setImageFiles}
      />

      {/* Show Property Commission Popup */}
      <PropertyCommissionPopup />

      {/* ADD Property Location Latitude & Longitude Form */}
      <div
        className={` ${
          !showPropertyLocationForm && "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] max-h-[80vh] bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">
              Update Latitude & Longitude
            </h2>
            <IoMdClose
              onClick={() => {
                setShowPropertyLocationForm(false);
                setLatitude(null);
                setLongitude(null);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={updatePropertyLocation}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1 lg:grid-cols-1">
              <input
                type="hidden"
                value={propertyKey || ""}
                onChange={(e) => setPropertyKey(e.target.value)}
              />
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium ">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Enter Latitude"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={latitude ?? ""}
                  onChange={(e) =>
                    setLatitude(
                      e.target.value === "" ? null : parseFloat(e.target.value),
                    )
                  }
                />
              </div>

              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium ">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Enter Longitude"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={longitude ?? ""}
                  onChange={(e) =>
                    setLongitude(
                      e.target.value === "" ? null : parseFloat(e.target.value),
                    )
                  }
                />
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowPropertyLocationForm(false);
                  setLatitude("");
                  setLongitude("");
                }}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Update
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>

      {/* ADD Brochure and Video Upload Form */}
      <div
        className={` ${
          !showVideoUploadForm && "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto`}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[450px] max-h-[80vh] bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Brochure & Video</h2>
            <IoMdClose
              onClick={() => {
                setShowVideoUploadForm(false);
                setSelectedImage(null);
                setVideoUpload({ brochureFile: "", videoLink: "" });
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>

          <form onSubmit={uploadVideo}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1">
              <input
                type="hidden"
                value={propertyKey || ""}
                onChange={(e) => setPropertyKey(e.target.value)}
              />

              {/* Brochure Upload */}
              <div className="w-full">
                {videoUpload?.brochureFile && (
                  <div className="relative mb-3">
                    <img
                      onClick={() => {
                        window.open(
                          getImageURI(videoUpload?.brochureFile),
                          "_blank",
                        );
                      }}
                      src={getImageURI(videoUpload?.brochureFile)}
                      alt="Old Image"
                      className="w-full max-w-[100px] object-cover rounded-lg border border-gray-300 cursor-pointer"
                    />
                  </div>
                )}

                <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
                  Brochure Image / PDF
                </label>
                <div className="w-full mt-2">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const allowedTypes = [
                          "image/jpeg",
                          "image/png",
                          "image/webp",
                          "application/pdf",
                        ];
                        const maxSize = 300 * 1024 * 1024;

                        if (!allowedTypes.includes(file.type)) {
                          alert(
                            "Only JPG, PNG, WEBP, or PDF files are allowed.",
                          );
                          e.target.value = "";
                          return;
                        }

                        if (file.size > maxSize) {
                          alert("File size must be less than 300MB.");
                          e.target.value = "";
                          return;
                        }

                        setSelectedImage(file);
                      }
                    }}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer"
                  >
                    <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                      Upload Image / PDF
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
                      className="w-full max-w-[400px] object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeSingleImage}
                      className="absolute top-2 left-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* YouTube Video Link */}
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#0000007b] font-medium">
                  Video Link
                </label>
                <input
                  type="url"
                  placeholder="Enter YouTube video URL"
                  className="w-full mt-[8px] text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#076300]"
                  value={videoUpload.videoLink}
                  onChange={(e) => {
                    const url = e.target.value.trim();

                    setVideoUpload({
                      ...videoUpload,
                      videoLink: url,
                    });
                  }}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  deleteBrochure();
                }}
                className="deleteButton z-10 px-2 lg:px-4 py-[6px] cursor-pointer flex items-center justify-center gap-2 border border-[#00000033] rounded-tr-md rounded-bl-md bg-[#e01a1a] font-semibold text-4 leading-5 text-[#FFFFFF] active:scale-[0.98]"
              >
                <p className="hidden lg:block">Delete</p>
                <MdDelete className="text-[20px]" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowVideoUploadForm(false);
                  setSelectedImage(null);
                  setVideoUpload({ brochureFile: "", videoLink: "" });
                }}
                className="px-4 py-2 leading-4 text-white bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Upload
              </button>
              <Loader />
            </div>
          </form>
        </div>
      </div>

      {/* Change Project Partner */}
      <div
        className={` ${
          !showChangeProjectPartnerForm && "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto`}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] min-h-[350px] max-h-[70vh] bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">
              Change Project Partner
            </h2>
            <IoMdClose
              onClick={() => {
                setShowChangeProjectPartnerForm(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={changeProjectPartner}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1">
              <input
                type="hidden"
                value={propertyKey}
                onChange={(e) => {
                  setPropertyKey(e.target.value);
                }}
              />

              {/* Project Partner */}
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium mb-[10px]">
                  Select Project Partner <span className="text-red-600">*</span>
                </label>
                <Select
                  required
                  styles={customStyle}
                  className="text-[16px] font-medium"
                  options={
                    projectPartnerList
                      ?.filter((pp) => pp.status === "Active")
                      .map((pp) => ({
                        value: {
                          projectPartnerId: pp.id,
                          projectPartner: pp.fullname,
                          projectPartnerContact: pp.contact,
                        },
                        label: `${pp.fullname} | ${pp.contact}`,
                      })) || []
                  }
                  placeholder="Select Project Partner"
                  value={
                    projectPartnerChange
                      ? projectPartnerList
                          ?.filter((pp) => pp.status === "Active")
                          .map((pp) => ({
                            value: {
                              projectPartnerId: pp.id,
                              projectPartner: pp.fullname,
                              projectPartnerContact: pp.contact,
                            },
                            label: `${pp.fullname} | ${pp.contact}`,
                          }))
                          .find(
                            (opt) =>
                              opt.value.projectPartnerId ===
                              projectPartnerChange.projectPartnerId,
                          ) || null
                      : null
                  }
                  onChange={(selected) =>
                    setProjectPartnerChange(selected?.value || null)
                  }
                />
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowChangeProjectPartnerForm(false);
                }}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Assign
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>

      <div
        className={`${
          showAdditionalInfoForm ? "flex" : "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] max-h-[80vh] bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">
              Additional Information
            </h2>
            <IoMdClose
              onClick={() => {
                setShowAdditionalInfoForm(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={addCsv}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1">
              <input
                type="hidden"
                value={newAddInfo.propertyid || ""}
                onChange={(e) =>
                  setNewAddInfo({
                    ...newAddInfo,
                    propertyid: e.target.value,
                  })
                }
              />

              <div className="w-full mt-2">
                <input
                  type="file"
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
                  <span className="m-3 p-2 overflow-hidden text-[16px] font-medium text-[#00000066]">
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
                data={additionalInfoCSVFileFormat}
                filename={"Additional_Info_File_Format.csv"}
              />
              <button
                type="submit"
                className="px-4 py-2 text-white font-semibold bg-[#076300] rounded active:scale-[0.98]"
              >
                ADD CSV File
              </button>
              <Loader />
            </div>
          </form>
        </div>
      </div>

      {/* This is For New Plot Additional Info */}
      <div
        className={`${
          showNewPlotAdditionalInfoForm ? "flex" : "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] max-h-[80vh] bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">
              Additional Information
            </h2>
            <IoMdClose
              onClick={() => {
                setShowNewPlotAdditionalInfoForm(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={addCsvForNewPlot}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1">
              <input
                type="hidden"
                value={newAddInfo.propertyid || ""}
                onChange={(e) =>
                  setNewAddInfo({
                    ...newAddInfo,
                    propertyid: e.target.value,
                  })
                }
              />

              <div className="w-full mt-2">
                <input
                  type="file"
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
                  <span className="m-3 p-2 overflow-hidden text-[16px] font-medium text-[#00000066]">
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
                data={additionalInfoNewPlotCSVFileFormat}
                filename={"Plot_Additional_Info_File_Format.csv"}
              />
              <button
                type="submit"
                className="px-4 py-2 text-white font-semibold bg-[#076300] rounded active:scale-[0.98]"
              >
                ADD CSV File
              </button>
              <Loader />
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
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] max-h-[80vh] bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">SEO Details</h2>
            <IoMdClose
              onClick={() => {
                setShowSeoForm(false);
                setSeoSlug("");
                setSeoTittle("");
                setSeoDescription("");
                setPropertyDescription("");
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={addSeoDetails}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1 lg:grid-cols-1">
              <input
                type="hidden"
                value={propertyKey || ""}
                onChange={(e) => setPropertyKey(e.target.value)}
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
                  placeholder="Enter SEO Description"
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                />
              </div>
              <div className={`w-full `}>
                <label className="block text-sm leading-4 text-[#00000066] font-medium ">
                  Property Description
                </label>
                <textarea
                  rows={4}
                  cols={40}
                  placeholder="Enter Property Description"
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={propertyDescription}
                  onChange={(e) => setPropertyDescription(e.target.value)}
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
                  setPropertyDescription("");
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

      {/* Set Top Picks Property Form */}
      <div
        className={`${
          !showTopPicksForm && "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto`}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] max-h-[80vh] bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Set Top Picks</h2>
            <IoMdClose
              onClick={() => setShowTopPicksForm(false)}
              className="w-6 h-6 cursor-pointer"
            />
          </div>

          <form onSubmit={addTopPicks}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1 lg:grid-cols-1">
              {/* Hidden Property Key */}
              <input
                type="hidden"
                value={propertyKey || ""}
                onChange={(e) => setPropertyKey(e.target.value)}
              />

              {/* Top Picks Status */}
              <div className="w-full">
                <select
                  value={topPicks.topPicksStatus}
                  onChange={(e) =>
                    setTopPicks({
                      ...topPicks,
                      topPicksStatus: e.target.value,
                    })
                  }
                  className={`${
                    topPicks.topPicksStatus === "Active"
                      ? "text-green-600 font-bold"
                      : topPicks.topPicksStatus === "Inactive"
                        ? "text-red-500 font-bold"
                        : ""
                  } w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none`}
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Top Picks Banner Upload */}
              <div className="w-full">
                <div className="w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const MAX_SIZE = 2 * 1024 * 1024; // 2MB

                      if (file.size > MAX_SIZE) {
                        alert("Image size must be less than or equal to 2MB");
                        e.target.value = ""; // reset input
                        return;
                      }

                      setTopPicks({
                        ...topPicks,
                        topPicksBanner: file,
                      });
                    }}
                    className="hidden"
                    id="topPicksBannerUpload"
                  />
                  <label
                    htmlFor="topPicksBannerUpload"
                    className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer"
                  >
                    <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                      {topPicks.topPicksBanner instanceof File
                        ? topPicks.topPicksBanner.name
                        : "Select Image"}
                    </span>
                    <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                      Browse
                    </div>
                  </label>
                </div>

                {/* Preview Section */}
                {topPicks.topPicksBanner && (
                  <div className="relative mt-2 flex items-end justify-end">
                    <img
                      src={
                        topPicks.topPicksBanner instanceof File
                          ? URL.createObjectURL(topPicks.topPicksBanner)
                          : topPicks.topPicksBanner // Old image URL
                      }
                      alt="Top Picks Banner"
                      className="w-full object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setTopPicks({ ...topPicks, topPicksBanner: null })
                      }
                      className="absolute top-1 right-1 bg-red-500 text-white text-sm px-2 py-1 rounded-full"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => setShowTopPicksForm(false)}
                className="px-4 py-2 leading-4 text-white bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Save
              </button>

              <Loader />
            </div>
          </form>
        </div>
      </div>

      {/* ADD Reject Reason Form */}
      <div
        className={` ${
          !showRejectReasonForm && "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] max-h-[80vh] bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">
              Property Reject Reason
            </h2>
            <IoMdClose
              onClick={() => {
                setShowRejectReasonForm(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={addRejectReason}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1 lg:grid-cols-1">
              <input
                type="hidden"
                value={propertyKey || ""}
                onChange={(e) => setPropertyKey(e.target.value)}
              />

              <div className={`w-full `}>
                <textarea
                  rows={2}
                  cols={40}
                  placeholder="Enter Reason"
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowRejectReasonForm(false);
                }}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Add Reason
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>

      {/* ADD Property Commission Form */}
      <div
        className={` ${
          !showCommissionForm && "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] max-h-[80vh] bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Property Commission</h2>
            <IoMdClose
              onClick={() => {
                setShowCommissionForm(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={addPropertyCommission}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1 lg:grid-cols-1">
              <input
                type="hidden"
                value={propertyKey || ""}
                onChange={(e) => setPropertyKey(e.target.value)}
              />

              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Commission Type
                </label>
                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
                  style={{ backgroundImage: "none" }}
                  value={propertyCommission.commissionType}
                  onChange={(e) => {
                    setPropertyCommission({
                      ...propertyCommission,
                      commissionType: e.target.value,
                    });
                  }}
                >
                  <option value="" disabled>
                    Select Commission Type
                  </option>
                  <option value="Fixed">Fixed</option>
                  <option value="Percentage">Percentage</option>
                  <option value="PerSquareFeet">Square Feet</option>
                </select>
              </div>

              {propertyCommission.commissionType === "Fixed" && (
                <div className={`w-full`}>
                  <label className="block text-sm leading-4 text-[#00000066] font-medium ">
                    Commission Amount
                  </label>
                  <input
                    name="commissionAmount"
                    type="number"
                    required
                    placeholder="Enter Amount"
                    className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={propertyCommission.commissionAmount}
                    onChange={(e) => {
                      setPropertyCommission({
                        ...propertyCommission,
                        commissionAmount: e.target.value,
                      });
                    }}
                  />
                </div>
              )}

              {propertyCommission.commissionType === "Percentage" && (
                <div className={`w-full`}>
                  <label className="block text-sm leading-4 text-[#00000066] font-medium ">
                    Commission Percentage
                  </label>
                  <input
                    name="commissionPercentage"
                    type="number"
                    required
                    placeholder="Enter Percentage"
                    className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={propertyCommission.commissionPercentage}
                    onChange={(e) => {
                      setPropertyCommission({
                        ...propertyCommission,
                        commissionPercentage: e.target.value,
                      });
                    }}
                  />
                </div>
              )}

              {propertyCommission.commissionType === "PerSquareFeet" && (
                <div className={`w-full`}>
                  <label className="block text-sm leading-4 text-[#00000066] font-medium ">
                    Commission per Square Feet
                  </label>
                  <input
                    name="commissionAmountPerSquareFeet"
                    type="number"
                    required
                    placeholder="Enter Amount per Square Feet"
                    className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={propertyCommission.commissionAmountPerSquareFeet}
                    onChange={(e) => {
                      setPropertyCommission({
                        ...propertyCommission,
                        commissionAmountPerSquareFeet: e.target.value,
                      });
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowCommissionForm(false);
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
    </div>
  );
};

export default Properties;
