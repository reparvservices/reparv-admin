import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { FiRefreshCw, FiEdit2, FiToggleRight, FiBriefcase, FiPhoneCall, FiKey, FiGlobe, FiGift, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../store/auth";
import { getImageURI } from "../utils/helper";
import useProjectPartnerActions from "../components/projectPartner/useProjectPartnerActions";

const PARTNER_LIST_PATH = "/users?type=partners&tab=project-partner";

const PROFILE_ACTIONS = [
  { key: "update", label: "Update", icon: FiEdit2 },
  { key: "status", label: "Status", icon: FiToggleRight },
  { key: "assignEnterprise", label: "Assign Enterprise", icon: FiBriefcase },
  { key: "followup", label: "Follow Up", icon: FiPhoneCall },
  { key: "assignlogin", label: "Assign Login", icon: FiKey },
  { key: "SEO", label: "Landing Page SEO", icon: FiGlobe },
  { key: "free", label: "Set Free Partner", icon: FiGift },
  { key: "delete", label: "Delete", icon: FiTrash2, danger: true },
];

const ProjectPartnerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { URI } = useAuth();

  const [partner, setPartner] = useState(null);
  const [followUpList, setFollowUpList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const [partnerRes, followUpRes] = await Promise.all([
        fetch(`${URI}/admin/projectpartner/get/${id}`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }),
        fetch(`${URI}/admin/projectpartner/followup/list/${id}`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }),
      ]);

      const data = await partnerRes.json().catch(() => ({}));
      if (!partnerRes.ok) {
        throw new Error(data.message || "Failed to fetch Project Partner.");
      }
      setPartner(data);

      // Follow ups are secondary; don't fail the whole page on them
      const followUps = followUpRes.ok
        ? await followUpRes.json().catch(() => [])
        : [];
      setFollowUpList(Array.isArray(followUps) ? followUps : []);
    } catch (err) {
      setPartner(null);
      setError(err.message || "Failed to fetch Project Partner.");
    } finally {
      setLoading(false);
    }
  }, [URI, id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const { runAction, actionModals } = useProjectPartnerActions({
    onChanged: () => fetchProfile({ silent: true }),
    onDeleted: () => navigate(PARTNER_LIST_PATH, { replace: true }),
  });

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(PARTNER_LIST_PATH);
  };

  const header = (
    <div className="flex items-center justify-between gap-3 mb-4">
      <button
        type="button"
        onClick={goBack}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <IoArrowBack className="w-4 h-4" />
        Back to Project Partners
      </button>
      <button
        type="button"
        onClick={() => fetchProfile()}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
      >
        <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </button>
    </div>
  );

  if (loading && !partner) {
    return (
      <div className="w-full p-4 sm:p-6">
        {header}
        <div className="p-10 text-sm text-center text-gray-500 bg-white rounded-2xl">
          Loading partner details...
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="w-full p-4 sm:p-6">
        {header}
        <div className="p-10 text-center bg-white rounded-2xl">
          <p className="text-sm font-medium text-red-600">
            {error || "Project Partner not found."}
          </p>
          <button
            type="button"
            onClick={() => fetchProfile()}
            className="px-4 py-2 mt-4 text-sm font-medium text-white bg-[#076300] rounded-lg"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const profileImage = getImageURI(partner.userimage);
  const coverImage = getImageURI(partner.coverImage);

  return (
    <div className="w-full p-4 overflow-y-auto sm:p-6 scrollbar-hide">
      {actionModals}
      {header}

      {/* Profile header */}
      <div className="overflow-hidden bg-white border border-gray-100 rounded-2xl">
        <div
          className="h-28 sm:h-36 bg-gradient-to-r from-[#076300] to-[#0BB501] bg-cover bg-center"
          style={coverImage ? { backgroundImage: `url(${coverImage})` } : undefined}
        />
        <div className="flex flex-col gap-4 px-4 pb-5 sm:px-6 sm:flex-row sm:items-end">
          {profileImage ? (
            <img
              src={profileImage}
              alt={partner.fullname || "Partner"}
              className="object-cover w-24 h-24 -mt-12 bg-white border-4 border-white rounded-full shadow"
            />
          ) : (
            <div className="w-24 h-24 -mt-12 rounded-full border-4 border-white shadow bg-[#0BB501] text-white flex items-center justify-center text-3xl font-semibold">
              {(partner.fullname || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 truncate">
              {partner.fullname || "—"}
            </h1>
            <p className="text-sm text-gray-600 truncate">
              {[partner.companyName, partner.displayRole]
                .filter(Boolean)
                .join(" • ") || "Project Partner"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              ID: {partner.id ?? "—"}
              {partner.username ? ` • Username: ${partner.username}` : ""}
              {partner.city ? ` • ${partner.city}` : ""}
              {partner.state ? `, ${partner.state}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill label="Status" value={partner.status} />
            <StatusPill label="Login" value={partner.loginstatus} />
            <StatusPill label="Payment" value={partner.paymentstatus} />
          </div>
        </div>
      </div>

      {/* Partner actions (same as the list Action menu) */}
      <div className="p-4 mt-4 bg-white border border-gray-100 rounded-2xl">
        <h3 className="mb-3 text-[15px] font-semibold">Actions</h3>
        <div className="flex flex-wrap gap-2">
          {PROFILE_ACTIONS.map(({ key, label, icon: Icon, danger }) => (
            <button
              key={key}
              type="button"
              onClick={() => runAction(key, partner)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg active:scale-[0.98] ${
                danger
                  ? "text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
                  : "text-[#076300] border-[#0763001f] bg-[#E3FFDF] hover:bg-[#d3f8cd]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-4 xl:grid-cols-2">
        <DetailCard title="Account">
          <DetailField label="Status" value={partner.status} />
          <DetailField label="Login Status" value={partner.loginstatus} />
          <DetailField label="Payment Status" value={partner.paymentstatus} />
          <DetailField label="Free Partner" value={partner.freeProjectPartner} />
          <DetailField
            label="Used Trial"
            value={
              partner.hasUsedTrial == null
                ? null
                : partner.hasUsedTrial
                  ? "Yes"
                  : "No"
            }
          />
          <DetailField label="Referral" value={partner.referral} />
          <DetailField label="Reference" value={partner.refrence} />
          <DetailField label="Agreement" value={partner.agreement} />
          <DetailField
            label="Registered On"
            value={formatDetailDate(partner.created_at, true)}
          />
          <DetailField
            label="Last Updated"
            value={formatDetailDate(partner.updated_at, true)}
          />
        </DetailCard>

        <DetailCard title="Personal Details">
          <DetailField label="Full Name" value={partner.fullname} />
          <DetailField label="Contact" value={partner.contact} />
          <DetailField label="WhatsApp Number" value={partner.whatsappNumber} />
          <DetailField label="Email" value={partner.email} />
          <DetailField label="Experience" value={partner.experience} />
          <DetailField label="Pin-Code" value={partner.pincode} />
          <DetailField label="State" value={partner.state} />
          <DetailField label="City" value={partner.city} />
          <DetailField label="Address" value={partner.address} wide />
          <DetailField
            label="Why Interested to Join Reparv"
            value={partner.intrest}
            wide
          />
          <DetailField label="Short Bio" value={partner.shortBio} wide />
          <DetailField label="Bio" value={partner.bio} wide />
        </DetailCard>

        <DetailCard title="Business Details">
          <DetailField label="Company Name" value={partner.companyName} />
          <DetailField label="Website" value={partner.website} link />
          <DetailField label="Location" value={partner.location} />
          <DetailField label="Business Pin-Code" value={partner.businessPincode} />
          <DetailField label="Business State" value={partner.businessState} />
          <DetailField label="Business City" value={partner.businessCity} />
          <DetailField
            label="Business Address"
            value={partner.businessAddress}
            wide
          />
          <DetailField
            label="Business Categories"
            value={formatListValue(partner.BusinessCategories)}
            wide
          />
          <DetailField
            label="Territories"
            value={formatListValue(partner.territories)}
            wide
          />
        </DetailCard>

        <DetailCard title="KYC & Bank Details">
          <DetailField label="Aadhaar No" value={partner.adharno} />
          <DetailField label="PAN No" value={partner.panno} />
          <DetailField label="RERA No" value={partner.rerano} />
          <DetailField label="Bank Name" value={partner.bankname} />
          <DetailField
            label="Account Holder Name"
            value={partner.accountholdername}
          />
          <DetailField label="Account Number" value={partner.accountnumber} />
          <DetailField label="IFSC Code" value={partner.ifsc} />
        </DetailCard>

        <DetailCard title="Subscription Details">
          <DetailField
            label="Plan"
            value={partner.plan ? `${partner.plan} Months` : null}
          />
          <DetailField label="Payment Type" value={partner.payment_type} />
          <DetailField
            label="Start Date"
            value={formatDetailDate(partner.start_date)}
          />
          <DetailField
            label="End Date"
            value={formatDetailDate(partner.end_date)}
          />
          <DetailField label="Payment ID" value={partner.paymentid} />
          <DetailField
            label="Registration Amount"
            value={partner.amount != null ? `₹${partner.amount}` : null}
          />
        </DetailCard>

        <DetailCard title="Social Links">
          <DetailField label="LinkedIn" value={partner.linkedinUrl} link />
          <DetailField label="Instagram" value={partner.instagramUrl} link />
          <DetailField label="YouTube" value={partner.youtubeUrl} link />
          <DetailField label="Facebook" value={partner.facebookUrl} link />
          <DetailField label="Twitter" value={partner.twitterUrl} link />
          <DetailField label="Telegram" value={partner.telegramUrl} link />
        </DetailCard>
      </div>

      <DetailCard title="Documents & Images" className="mt-4" columns="lg:grid-cols-3">
        {[
          ["Profile Image", partner.userimage],
          ["Cover Image", partner.coverImage],
          ["Business Logo", partner.businessLogo],
          ["Aadhaar Images", partner.adharimage],
          ["PAN Card Images", partner.panimage],
          ["RERA Images", partner.reraimage],
        ].map(([label, value]) => {
          const images = parseImageList(value);
          return (
            <div key={label} className="w-full">
              <p className="text-sm leading-4 text-[#00000066] font-medium">
                {label}
              </p>
              {images.length === 0 ? (
                <p className="mt-2 text-[15px] font-medium">—</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {images.map((src, index) => (
                    <img
                      key={`${src}-${index}`}
                      src={src}
                      alt={`${label} ${index + 1}`}
                      onClick={() => window.open(src, "_blank")}
                      className="w-full h-32 border border-[#00000033] rounded-[4px] object-cover cursor-pointer"
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </DetailCard>

      {/* Subscription History */}
      <div className="p-4 mt-4 bg-white border border-gray-100 sm:p-6 rounded-2xl">
        <h3 className="text-[15px] font-semibold mb-3 border-b pb-2">
          Subscription History
        </h3>
        {!partner.subscriptionHistory?.length ? (
          <p className="text-sm text-gray-500">No subscription history found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-[#00000022]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Plan</th>
                  <th className="p-2 border">Amount</th>
                  <th className="p-2 border">Start</th>
                  <th className="p-2 border">End</th>
                  <th className="p-2 border">Payment</th>
                  <th className="p-2 border">Payment ID</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {partner.subscriptionHistory.map((sub) => (
                  <tr key={sub.id} className="text-center">
                    <td className="p-2 border">
                      {sub.plan ? `${sub.plan} Months` : "—"}
                    </td>
                    <td className="p-2 border">
                      {sub.amount != null ? `₹${sub.amount}` : "—"}
                    </td>
                    <td className="p-2 border">
                      {formatDetailDate(sub.start_date) || "—"}
                    </td>
                    <td className="p-2 border">
                      {formatDetailDate(sub.end_date) || "—"}
                    </td>
                    <td className="p-2 border capitalize">
                      {sub.payment_type || "—"}
                    </td>
                    <td className="p-2 border break-all">
                      {sub.payment_id || "—"}
                    </td>
                    <td className="p-2 border capitalize">{sub.status || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Follow Up History */}
      <div className="p-4 mt-4 mb-6 bg-white border border-gray-100 sm:p-6 rounded-2xl">
        <h3 className="text-[15px] font-semibold mb-3 border-b pb-2">
          Follow Up History
        </h3>
        {followUpList.length === 0 ? (
          <p className="text-sm text-gray-500">No follow ups found</p>
        ) : (
          <div className="flex flex-col gap-3">
            {followUpList.map((followUp, index) => (
              <div
                key={followUp.id ?? index}
                className="p-3 border border-gray-100 rounded-lg bg-gray-50"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span>{followUp.created_at}</span>
                  {followUp.followUp ? (
                    <span className="px-2 py-[2px] rounded-lg bg-[#E3FFDF] text-[#076300] font-medium">
                      {followUp.followUp}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-800 whitespace-pre-line">
                  {followUp.followUpText || "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const formatDetailDate = (value, withTime = false) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return withTime
    ? date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

// Stored as a JSON array string, a plain string, or comma separated text
const formatListValue = (value) => {
  if (value == null || value === "") return "";
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) =>
          typeof item === "object" && item !== null
            ? item.name || item.city || item.title || JSON.stringify(item)
            : item,
        )
        .filter(Boolean)
        .join(", ");
    }
    return String(parsed);
  } catch {
    return String(value);
  }
};

// Image columns hold a JSON array of paths/URLs or a single URL string
const parseImageList = (value) => {
  if (!value) return [];
  let list;
  try {
    const parsed = JSON.parse(value);
    list = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    list = [value];
  }
  return list
    .filter((item) => typeof item === "string")
    .map((item) => getImageURI(item))
    .filter(Boolean);
};

const StatusPill = ({ label, value }) => {
  const v = String(value || "").toLowerCase();
  const tone =
    v === "active" || v === "success" || v === "paid"
      ? "bg-green-100 text-green-700"
      : v === "inactive" || v === "failed" || v === "unpaid"
        ? "bg-red-100 text-red-600"
        : "bg-gray-100 text-gray-600";
  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${tone}`}>
      {label}: {value || "—"}
    </span>
  );
};

const DetailCard = ({ title, children, className = "", columns = "" }) => (
  <div
    className={`p-4 sm:p-6 bg-white border border-gray-100 rounded-2xl ${className}`}
  >
    <h3 className="text-[15px] font-semibold mb-3 border-b pb-2">{title}</h3>
    <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 ${columns}`}>
      {children}
    </div>
  </div>
);

const DetailField = ({ label, value, wide = false, link = false }) => {
  const text = value == null || value === "" ? "" : String(value);
  const href =
    link && text && !/^https?:\/\//i.test(text) ? `https://${text}` : text;
  return (
    <div className={`w-full min-w-0 ${wide ? "sm:col-span-2" : ""}`}>
      <p className="text-sm leading-4 text-[#00000066] font-medium">{label}</p>
      {link && text ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2 text-[15px] font-medium text-[#0068FF] break-all hover:underline"
        >
          {text}
        </a>
      ) : (
        <p className="mt-2 text-[15px] font-medium break-words whitespace-pre-line">
          {text || "—"}
        </p>
      )}
    </div>
  );
};

export default ProjectPartnerProfile;
