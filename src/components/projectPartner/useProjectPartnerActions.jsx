import { useState, useEffect, useRef } from "react";
import { IoMdClose } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { useAuth } from "../../store/auth";
import SubmitButton from "../ui/SubmitButton";
import AssignEnterpriseModal from "../AssignEnterpriseModal";
import ConfirmDialog from "../ConfirmDialog";

const EMPTY_PARTNER = {
  fullname: "",
  contact: "",
  email: "",
  state: "",
  city: "",
  intrest: "",
};

const FOLLOW_UP_BADGE = {
  CNR1: "bg-red-100 text-red-600",
  CNR2: "bg-red-100 text-red-600",
  CNR3: "bg-red-100 text-red-600",
  CNR4: "bg-red-100 text-red-600",
  "Switch Off": "bg-red-100 text-red-700",
  "Call Busy": "bg-yellow-100 text-yellow-600",
  "Call Back": "bg-yellow-100 text-yellow-600",
  "Not Responding (After Follow Up)": "bg-yellow-100 text-yellow-600",
  "Call Cut / Disconnected": "bg-orange-100 text-orange-600",
  "Not Interested (After Details Shared & Explanation)":
    "bg-orange-100 text-orange-600",
  "Invalid Number": "bg-red-100 text-red-700",
  "Wrong Number": "bg-red-100 text-red-700",
  "Form Filled By Mistake": "bg-blue-100 text-blue-600",
  "Repeat Lead": "bg-gray-100 text-gray-600",
  "Lead Clash": "bg-purple-100 text-purple-500",
  "Details Shared": "bg-green-100 text-green-600",
  "Not Interested": "bg-pink-100 text-pink-600",
  Interested: "bg-green-100 text-green-700",
  "Documents Collected": "bg-green-100 text-green-800",
  "Payment Done": "bg-green-100 text-green-900",
};

export const followUpBadgeClass = (value) =>
  FOLLOW_UP_BADGE[value] || "bg-gray-100 text-black";

/**
 * All Project Partner row actions (add/update, status, enterprise, follow up,
 * login, SEO, free partner, delete) with their modals, shared by the partner
 * list and the partner profile page.
 *
 * runAction(action, { id, fullname }) opens/performs an action.
 * actionModals must be rendered once by the page.
 */
export default function useProjectPartnerActions({
  onChanged,
  onDeleted,
  onFollowUpAdded,
} = {}) {
  const {
    URI,
    showPartnerForm,
    setShowPartnerForm,
    giveAccess,
    setGiveAccess,
    showSeoForm,
    setShowSeoForm,
    showFollowUpList,
    setShowFollowUpList,
  } = useAuth();

  const [partnerId, setPartnerId] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [newPartner, setNewPartner] = useState(EMPTY_PARTNER);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showAssignEnterprise, setShowAssignEnterprise] = useState(false);
  const [assignPartnerName, setAssignPartnerName] = useState("");

  const [twitterSite, setTwitterSite] = useState("");
  const [twitterDescription, setTwitterDescription] = useState("");
  const [seoSlug, setSeoSlug] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  const [followUp, setFollowUp] = useState("");
  const [followUpText, setFollowUpText] = useState("");
  const [followUpList, setFollowUpList] = useState([]);

  // Keep latest callbacks without re-creating handlers
  const callbacks = useRef({});
  callbacks.current = { onChanged, onDeleted, onFollowUpAdded };
  const changed = () => callbacks.current.onChanged?.();

  const noticeTimer = useRef(null);
  const showNotice = (type, message) => {
    setNotice({ type, message });
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(
      () => setNotice({ type: "", message: "" }),
      5000,
    );
  };

  // Global modal flags live in the auth store (Layout draws the backdrop);
  // close them when the page using this hook unmounts.
  useEffect(
    () => () => {
      window.clearTimeout(noticeTimer.current);
      setShowPartnerForm(false);
      setGiveAccess(false);
      setShowSeoForm(false);
      setShowFollowUpList(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const openConfirm = ({ title, message, confirmLabel, variant, onConfirm }) => {
    setConfirmDialog({ title, message, confirmLabel, variant, onConfirm });
  };

  const closeConfirm = () => {
    if (!confirmLoading) setConfirmDialog(null);
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog?.onConfirm) return;
    setConfirmLoading(true);
    try {
      await confirmDialog.onConfirm();
    } finally {
      setConfirmLoading(false);
      setConfirmDialog(null);
    }
  };

  const request = async (path, options = {}) => {
    const response = await fetch(`${URI}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await response.json().catch(() => ({}));
    return { response, data };
  };

  // **Fetch States / Cities for the partner form**
  const fetchStates = async () => {
    try {
      const { response, data } = await request("/admin/states");
      if (response.ok) setStates(data);
    } catch {
      setStates([]);
    }
  };

  useEffect(() => {
    if (!showPartnerForm || states.length) return;
    fetchStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPartnerForm]);

  useEffect(() => {
    if (!newPartner.state) return;
    (async () => {
      try {
        const { response, data } = await request(
          `/admin/cities/${newPartner.state}`,
        );
        if (response.ok) setCities(data);
      } catch {
        setCities([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newPartner.state]);

  // Add / Update partner
  const savePartner = async (e) => {
    e.preventDefault();
    const endpoint = newPartner.id ? `edit/${newPartner.id}` : "add";
    try {
      setActionBusy(true);
      const response = await fetch(`${URI}/admin/projectpartner/${endpoint}`, {
        method: newPartner.id ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPartner),
      });

      if (response.status === 409) {
        showNotice("error", "Partner already exists!");
      } else if (!response.ok) {
        throw new Error(`Failed to save partner. Status: ${response.status}`);
      } else {
        showNotice(
          "success",
          newPartner.id
            ? "Project Partner updated successfully!"
            : "Project Partner added successfully!",
        );
        setNewPartner(EMPTY_PARTNER);
        setShowPartnerForm(false);
        changed();
      }
    } catch (err) {
      showNotice("error", err.message || "Could not save partner.");
    } finally {
      setActionBusy(false);
    }
  };

  const openAdd = () => {
    setNewPartner(EMPTY_PARTNER);
    setShowPartnerForm(true);
  };

  const openEdit = async (id) => {
    try {
      const { response, data } = await request(`/admin/projectpartner/get/${id}`);
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch Project Partner.");
      }
      setNewPartner({ ...EMPTY_PARTNER, ...data });
      setShowPartnerForm(true);
    } catch (err) {
      showNotice("error", err.message || "Failed to fetch Project Partner.");
    }
  };

  const deletePartner = async (id) => {
    try {
      setActionBusy(true);
      const { response, data } = await request(
        `/admin/projectpartner/delete/${id}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        showNotice("success", "Partner deleted successfully!");
        if (callbacks.current.onDeleted) callbacks.current.onDeleted(id);
        else changed();
      } else {
        showNotice("error", data.message || "Failed to delete partner");
      }
    } catch {
      showNotice("error", "Failed to delete partner");
    } finally {
      setActionBusy(false);
    }
  };

  const changePartnerStatus = async (id) => {
    try {
      const { response, data } = await request(
        `/admin/projectpartner/status/${id}`,
        { method: "PUT" },
      );
      if (response.ok) {
        showNotice("success", data.message || "Status updated successfully");
      } else {
        showNotice("error", data.message || "Failed to update status");
      }
      changed();
    } catch {
      showNotice("error", "Failed to update status");
    }
  };

  const resetSeo = () => {
    setSeoSlug("");
    setSeoTitle("");
    setSeoDescription("");
    setSeoKeywords("");
    setTwitterSite("");
    setTwitterDescription("");
  };

  const openSeo = async (id) => {
    try {
      const { response, data } = await request(`/admin/projectpartner/get/${id}`);
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch project Partner.");
      }
      setSeoSlug(data.seoSlug || "");
      setSeoTitle(data.seoTitle || "");
      setSeoDescription(data.seoDescription || "");
      setSeoKeywords(data.seoKeywords || "");
      setTwitterSite(data.twitterSite || "");
      setTwitterDescription(data.twitterDescription || "");
      setShowSeoForm(true);
    } catch (err) {
      showNotice("error", err.message || "Failed to fetch project Partner.");
    }
  };

  // Add Or Update SEO Details Title , Description
  const saveSeo = async (e) => {
    e.preventDefault();
    try {
      setActionBusy(true);
      const { response, data } = await request(
        `/admin/projectpartner/seo/${partnerId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            seoSlug,
            seoTitle,
            seoDescription,
            seoKeywords,
            twitterSite,
            twitterDescription,
          }),
        },
      );
      if (response.ok) {
        showNotice("success", data.message || "SEO details saved");
      } else {
        showNotice("error", data.message || "Failed to save SEO details");
      }
      setShowSeoForm(false);
      resetSeo();
      changed();
    } catch {
      showNotice("error", "Failed to save SEO details.");
    } finally {
      setActionBusy(false);
    }
  };

  const applyFreePartner = async (id) => {
    try {
      const { response, data } = await request(
        `/admin/projectpartner/free-partner/${id}`,
        { method: "PUT" },
      );
      if (response.ok) {
        showNotice("success", data.message || "Free subscription applied");
      } else {
        showNotice("error", data.message || "Failed to set free partner");
      }
      changed();
    } catch {
      showNotice("error", "Failed to set free partner");
    }
  };

  // Fetch Follow Up List
  const fetchFollowUpList = async (id) => {
    try {
      const { response, data } = await request(
        `/admin/projectpartner/followup/list/${id}`,
      );
      setFollowUpList(response.ok && Array.isArray(data) ? data : []);
    } catch {
      setFollowUpList([]);
    }
  };

  // ADD Follow Up
  const addFollowUp = async (e) => {
    e.preventDefault();
    try {
      setActionBusy(true);
      const { response, data } = await request(
        `/admin/projectpartner/followup/add/${partnerId}`,
        {
          method: "POST",
          body: JSON.stringify({ followUp, followUpText }),
        },
      );
      if (response.ok) {
        showNotice("success", data.message || "Follow-up added");
        callbacks.current.onFollowUpAdded?.();
        changed();
        fetchFollowUpList(partnerId);
      } else {
        showNotice("error", data.message || "Failed to add follow-up");
      }
      setFollowUp("");
      setFollowUpText("");
    } catch {
      showNotice("error", "Failed to add follow-up.");
    } finally {
      setActionBusy(false);
    }
  };

  const submitAssignLogin = async () => {
    try {
      setActionBusy(true);
      const { response, data } = await request(
        `/admin/projectpartner/assignlogin/${partnerId}`,
        {
          method: "PUT",
          body: JSON.stringify({ partnerId, username, password }),
        },
      );
      if (response.ok) {
        showNotice("success", data.message || "Login assigned successfully");
      } else {
        showNotice("error", data.message || "Failed to assign login");
      }
      setUsername("");
      setPassword("");
      setGiveAccess(false);
      changed();
    } catch {
      showNotice("error", "Failed to assign login.");
    } finally {
      setActionBusy(false);
    }
  };

  const assignLogin = (e) => {
    e.preventDefault();
    openConfirm({
      title: "Assign login?",
      message: "Are you sure you want to assign login to this Project Partner?",
      confirmLabel: "Assign login",
      onConfirm: () => submitAssignLogin(),
    });
  };

  const runAction = (action, partner = {}) => {
    const id = partner.id;
    switch (action) {
      case "add":
        openAdd();
        break;
      case "update":
        openEdit(id);
        break;
      case "status":
        openConfirm({
          title: "Change partner status?",
          message:
            "Are you sure you want to change this Project Partner status?",
          confirmLabel: "Yes, change",
          onConfirm: () => changePartnerStatus(id),
        });
        break;
      case "assignEnterprise":
        setPartnerId(id);
        setAssignPartnerName(partner.fullname || "");
        setShowAssignEnterprise(true);
        break;
      case "followup":
        setPartnerId(id);
        setFollowUpList([]);
        fetchFollowUpList(id);
        setShowFollowUpList(true);
        break;
      case "assignlogin":
        setPartnerId(id);
        setUsername(partner.username || "");
        setPassword("");
        setGiveAccess(true);
        break;
      case "SEO":
        setPartnerId(id);
        openSeo(id);
        break;
      case "free":
        openConfirm({
          title: "Set free subscription?",
          message:
            "Are you sure you want to set a free subscription for this Project Partner?",
          confirmLabel: "Yes, set free",
          onConfirm: () => applyFreePartner(id),
        });
        break;
      case "delete":
        openConfirm({
          title: "Delete project partner?",
          message:
            "Are you sure you want to delete this Project Partner? This cannot be undone.",
          confirmLabel: "Delete",
          variant: "danger",
          onConfirm: () => deletePartner(id),
        });
        break;
      default:
    }
  };

  const inputClass =
    "w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500";
  const modalWrapClass =
    "z-[61] fixed inset-0 flex items-end md:items-center justify-center md:p-6 pointer-events-none";

  const actionModals = (
    <>
      {notice.message ? (
        <div
          className={`fixed top-4 left-1/2 z-[85] w-[min(100%,28rem)] -translate-x-1/2 rounded-xl border px-4 py-3 text-sm shadow-lg ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <p>{notice.message}</p>
            <button
              type="button"
              onClick={() => setNotice({ type: "", message: "" })}
              className="text-gray-500 hover:text-gray-800"
              aria-label="Dismiss"
            >
              <RxCross2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmDialog)}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        confirmLabel={confirmDialog?.confirmLabel}
        variant={confirmDialog?.variant}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
      />

      {/* Add / Update Partner Form */}
      <div className={`${showPartnerForm ? "flex" : "hidden"} ${modalWrapClass}`}>
        <div className="pointer-events-auto max-h-[85vh] w-[330px] sm:w-[600px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] bg-white py-8 pb-10 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Project Partner</h2>
            <IoMdClose
              onClick={() => setShowPartnerForm(false)}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={savePartner}>
            <div className="grid gap-6 md:gap-4 grid-cols-1 ">
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Full Name"
                  value={newPartner.fullname || ""}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, fullname: e.target.value })
                  }
                  className={inputClass}
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
                  value={newPartner.contact || ""}
                  onChange={(e) => {
                    // Allows only up to 10 digits
                    if (/^\d{0,10}$/.test(e.target.value)) {
                      setNewPartner({ ...newPartner, contact: e.target.value });
                    }
                  }}
                  className={inputClass}
                />
              </div>
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter Email"
                  value={newPartner.email || ""}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, email: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              {/* State Select Input */}
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Select State <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  className={`${inputClass} appearance-none bg-transparent`}
                  style={{ backgroundImage: "none" }}
                  value={newPartner.state || ""}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, state: e.target.value })
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
                  className={`${inputClass} appearance-none bg-transparent`}
                  style={{ backgroundImage: "none" }}
                  value={newPartner.city || ""}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, city: e.target.value })
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

              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Why are You Interested? <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  value={newPartner.intrest || ""}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, intrest: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="" disabled>
                    Why are You Interested?
                  </option>
                  <option value="Mutual Growth Opportunity">
                    Mutual Growth Opportunity
                  </option>
                  <option value="Strong Interest in Infrastructure and Development">
                    Strong Interest in Infrastructure and Development
                  </option>
                  <option value="Complementary Skills and Experience">
                    Complementary Skills and Experience
                  </option>
                  <option value="Market Expansion Vision">
                    Market Expansion Vision
                  </option>
                  <option value="Long-Term Value Creation">
                    Long-Term Value Creation
                  </option>
                  <option value="Collaborative Approach">
                    Collaborative Approach
                  </option>
                  <option value="Technology Integration">
                    Technology Integration
                  </option>
                  <option value="Interest in Sustainable and Smart Projects">
                    Interest in Sustainable and Smart Projects
                  </option>
                </select>
              </div>
            </div>
            <div className="flex h-10 mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => setShowPartnerForm(false)}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <SubmitButton busy={actionBusy} busyLabel="Saving…">
                Save
              </SubmitButton>
            </div>
          </form>
        </div>
      </div>

      {/* ADD SEO Details */}
      <div className={`${showSeoForm ? "flex" : "hidden"} ${modalWrapClass}`}>
        <div className="pointer-events-auto w-full overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] max-h-[80vh] bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">SEO Details</h2>
            <IoMdClose
              onClick={() => {
                setShowSeoForm(false);
                resetSeo();
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={saveSeo}>
            <div className="w-full grid gap-2 place-items-center grid-cols-1 lg:grid-cols-1">
              <div className="w-full">
                <label className="block text-xs ml-1 leading-4 text-[#00000066] font-medium ">
                  Twitter Site
                </label>
                <input
                  type="text"
                  placeholder="Enter Site"
                  className="w-full mt-[4px] text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={twitterSite}
                  onChange={(e) => setTwitterSite(e.target.value)}
                />
              </div>
              <div className="w-full">
                <label className="block text-xs ml-1 leading-4 text-[#00000066] font-medium ">
                  Twitter Description
                </label>
                <input
                  type="text"
                  placeholder="Enter Twitter Description"
                  className="w-full mt-[4px] text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={twitterDescription}
                  onChange={(e) => setTwitterDescription(e.target.value)}
                />
              </div>
              <div className="w-full">
                <label className="block text-xs ml-1 leading-4 text-[#00000066] font-medium ">
                  Seo Title <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={2}
                  cols={40}
                  placeholder="Enter SEO Title"
                  required
                  className="w-full mt-[4px] text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </div>
              <div className="w-full">
                <label className="block text-xs ml-1 leading-4 text-[#00000066] font-medium ">
                  Seo Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={3}
                  cols={40}
                  placeholder="Enter SEO Description"
                  required
                  className="w-full mt-[4px] text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                />
              </div>
              <div className="w-full">
                <label className="block text-xs ml-1 leading-4 text-[#00000066] font-medium ">
                  Seo Keywords <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={3}
                  cols={40}
                  required
                  placeholder="Enter SEO Keywords"
                  className="w-full mt-[4px] text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                />
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowSeoForm(false);
                  resetSeo();
                }}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <SubmitButton busy={actionBusy} busyLabel="Saving…">
                Add SEO Details
              </SubmitButton>
            </div>
          </form>
        </div>
      </div>

      <AssignEnterpriseModal
        show={showAssignEnterprise}
        onClose={() => {
          setShowAssignEnterprise(false);
          setPartnerId(null);
        }}
        initialUserId={partnerId}
        initialRole="project"
        partnerName={assignPartnerName}
        onSuccess={(msg) => {
          showNotice("success", msg);
          changed();
        }}
      />

      {/* Update Follow Up Form */}
      <div className={`${showFollowUpList ? "flex" : "hidden"} ${modalWrapClass}`}>
        <div className="pointer-events-auto w-[330px] sm:w-[600px]  overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] max-h-[75vh] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Partner Follow Up</h2>
            <IoMdClose
              onClick={() => setShowFollowUpList(false)}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={addFollowUp}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1">
              <select
                required
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                className="w-full p-4 border rounded-[4px] text-[16px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Select Follow Up</option>
                <option className="text-red-600">CNR1</option>
                <option className="text-red-600">CNR2</option>
                <option className="text-red-600">CNR3</option>
                <option className="text-red-600">CNR4</option>
                <option className="text-red-700">Switch Off</option>
                <option className="text-yellow-600">Call Busy</option>
                <option className="text-yellow-600">Call Back</option>
                <option className="text-yellow-600">
                  Not Responding (After Follow Up)
                </option>
                <option className="text-orange-600">
                  Call Cut / Disconnected
                </option>
                <option className="text-red-700">Invalid Number</option>
                <option className="text-red-700">Wrong Number</option>
                <option className="text-blue-600">Form Filled By Mistake</option>
                <option className="text-gray-600">Repeat Lead</option>
                <option className="text-purple-500">Lead Clash</option>
                <option className="text-green-600">Details Shared</option>
                <option className="text-pink-600">Not Interested</option>
                <option className="text-orange-600">
                  Not Interested (After Details Shared & Explanation)
                </option>
                <option className="text-green-700">Interested</option>
                <option className="text-green-800">Documents Collected</option>
                <option className="text-green-900">Payment Done</option>
              </select>

              <input
                type="text"
                required
                placeholder="Enter Custom Follow Up"
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                className="w-full p-4 border border-[#00000033] rounded-[4px] text-[16px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex h-10 mt-8 md:mt-4 justify-center sm:justify-end">
              <SubmitButton
                busy={actionBusy}
                busyLabel="Adding…"
                className="w-full sm:w-auto"
              >
                Add Follow Up
              </SubmitButton>
            </div>
          </form>
          {/* Show Follow Up List */}
          <div className="w-full mt-4">
            <div className="mt-2 flex flex-col gap-2">
              {followUpList.length > 0 ? (
                followUpList.map((item, index) => (
                  <div key={item.id ?? index} className="w-full">
                    <div className="flex gap-2 flex-wrap items-center justify-start mt-2 text-sm leading-4 text-[#00000066] font-medium">
                      <span>
                        {item?.created_at} {"->"}
                      </span>
                      <span
                        className={`px-[6px] py-[2px] rounded-lg text-xs font-medium ${followUpBadgeClass(
                          item?.followUp,
                        )}`}
                      >
                        {item?.followUp}
                      </span>
                    </div>
                    <input
                      type="text"
                      disabled
                      className="w-full mt-[6px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.followUpText || ""}
                      readOnly
                    />
                  </div>
                ))
              ) : (
                <input
                  type="text"
                  disabled
                  className="w-full text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value="No Follow Up Found"
                  readOnly
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Give Access Form */}
      <div className={`${giveAccess ? "flex" : "hidden"} ${modalWrapClass}`}>
        <div className="pointer-events-auto w-[330px] h-[380px] sm:w-[600px] sm:h-[400px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] lg:h-[300px] bg-white py-8 pb-10 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Give Access</h2>
            <IoMdClose
              onClick={() => setGiveAccess(false)}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={assignLogin}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1 lg:grid-cols-2">
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  User Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter UserName"
                  className={inputClass}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter Password"
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex h-10 mt-8 md:mt-6 justify-center sm:justify-end">
              <SubmitButton busy={actionBusy} busyLabel="Assigning…">
                Give Access
              </SubmitButton>
            </div>
          </form>
        </div>
      </div>
    </>
  );

  return { runAction, actionModals, actionBusy };
}
