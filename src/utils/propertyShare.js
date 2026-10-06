import { getImageURI } from "./helper";

// Same WhatsApp message as the partner mobile app and partner panel
// so clients get identical property details from any of them.

const WEBSITE_URL = "https://www.reparv.in";
const PUBLIC_PROPERTY_URL = `${WEBSITE_URL}/property-info`;

const FURNISHING_LABELS = {
  F: "Fully furnished",
  S: "Semi-furnished",
  U: "Unfurnished",
};

// Short hash of the cover photo URL, added to shared links as ?v=… — WhatsApp
// caches link previews per URL, so a new photo needs a new URL to show up.
function photoVersion(property) {
  const photo = getPropertyPhotoUrl(property);
  if (!photo) return null;
  let hash = 0;
  for (let i = 0; i < photo.length; i++) {
    hash = (hash * 31 + photo.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}

export function getPropertyUrl(property) {
  if (!property?.seoSlug) return null;
  const version = photoVersion(property);
  return `${PUBLIC_PROPERTY_URL}/${property.seoSlug}${version ? `?v=${version}` : ""}`;
}

// Asks the website to rebuild its cached property page, so WhatsApp's preview
// shows the current photo even right after it was changed.
function refreshPropertyPreview(property) {
  if (!property?.seoSlug) return;
  try {
    navigator.sendBeacon?.(`${WEBSITE_URL}/api/revalidate-property`, property.seoSlug);
  } catch {
    // Preview may be up to an hour old; the share still works
  }
}

function formatPrice(property) {
  const price = Number(property?.totalOfferPrice || property?.totalSalesPrice);
  return price > 0 ? `₹${price.toLocaleString("en-IN")}` : null;
}

function formatLocation(property) {
  const seen = new Set();
  return (
    [property?.location, property?.city, property?.state]
      .map((part) => String(part || "").trim())
      // Skip empty and repeated parts ("pune, Pune")
      .filter((part) => {
        const key = part.toLowerCase();
        if (!part || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .join(", ") || null
  );
}

function facingLabel(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  return /facing/i.test(text) ? text : `${text} facing`;
}

function furnishingLabel(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  // Stored as a single-letter code in some listings
  if (text.length === 1) return FURNISHING_LABELS[text.toUpperCase()] || null;
  return text;
}

/** WhatsApp-formatted (*bold*) summary of a property with its public link. */
export function buildPropertyShareText(property) {
  if (!property) return "";

  const area = Number(property.builtUpArea || property.carpetArea);
  const highlights = [
    property.propertyCategory,
    area > 0 ? `${area.toLocaleString("en-IN")} sq ft` : null,
    facingLabel(property.propertyFacing),
    furnishingLabel(property.furnishing),
  ].filter(Boolean);

  const location = formatLocation(property);
  const url = getPropertyUrl(property);

  const lines = [
    "🏡 *Property on Reparv*",
    "",
    `*${property.propertyName || "Residential Property"}*`,
  ];
  if (location) lines.push("", `📍 *Location:* ${location}`);
  const price = formatPrice(property);
  lines.push("", price ? `💰 *Price:* ${price}` : "💰 *Price on request*");
  if (highlights.length) {
    lines.push("", "✨ *Highlights:*", ...highlights.map((h) => `• ${h}`));
  }
  if (url) lines.push("", "🔗 *Photos, full details & free site visit:*", url);
  lines.push("", "📞 Interested? Reply to this message to know more.");
  return lines.join("\n");
}

// Photo sections in the order we'd pick a cover image from
const PHOTO_FIELDS = [
  "frontView",
  "sideView",
  "hallView",
  "kitchenView",
  "bedroomView",
  "bathroomView",
  "balconyView",
  "interiorView",
  "entranceView",
  "roadView",
  "parkingView",
  "officeArea",
  "cabinView",
  "showroomInterior",
  "displayArea",
  "warehouseArea",
  "loadingArea",
  "terraceSitout",
  "farmGardenArea",
  "nearestLandmark",
  "developedAmenities",
  "extraImages",
];

function toList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [value];
  }
}

/** URL of the property's first real photo, or null if it has none. */
export function getPropertyPhotoUrl(property) {
  for (const field of PHOTO_FIELDS) {
    const photo = toList(property?.[field]).find(
      (item) => typeof item === "string" && item.trim()
    );
    if (photo) return getImageURI(photo.trim());
  }
  return null;
}

const MIME_BY_EXT = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

// Photo downloads by URL, so hovering a button and then clicking it only
// fetches once — and the share starts before the click "expires".
const photoCache = new Map();

function fetchPhotoBlob(url) {
  if (!photoCache.has(url)) {
    const request = fetch(url)
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (!blob) return null;
        if (blob.type.startsWith("image/")) return blob;
        // S3 sometimes serves photos as application/octet-stream
        const ext = url.split("?")[0].match(/\.(jpe?g|png|webp)$/i)?.[1];
        return new Blob([blob], {
          type: MIME_BY_EXT[ext?.toLowerCase()] || "image/jpeg",
        });
      })
      .catch(() => null);
    request.then((blob) => !blob && photoCache.delete(url));
    photoCache.set(url, request);
  }
  return photoCache.get(url);
}

/** Starts downloading the cover photo early (call on hover/focus of the share button). */
export function prefetchPropertyPhoto(property) {
  const url = getPropertyPhotoUrl(property);
  if (url) fetchPhotoBlob(url);
  refreshPropertyPreview(property);
}

async function photoAsFile(property, url) {
  const blob = await fetchPhotoBlob(url);
  if (!blob) return null;
  const ext = blob.type.split("/")[1] === "jpeg" ? "jpg" : blob.type.split("/")[1];
  return new File([blob], `property-${property?.propertyid ?? "photo"}.${ext}`, {
    type: blob.type,
  });
}

// The clipboard only takes PNG images, so re-encode JPEG/WebP photos.
async function photoAsPng(url) {
  const blob = await fetchPhotoBlob(url);
  if (!blob) throw new Error("Photo unavailable");
  if (blob.type === "image/png") return blob;
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0);
  return new Promise((resolve, reject) =>
    canvas.toBlob((png) => (png ? resolve(png) : reject(new Error("PNG failed"))), "image/png")
  );
}

function canShareFiles() {
  try {
    return !!navigator.canShare?.({
      files: [new File([""], "photo.jpg", { type: "image/jpeg" })],
    });
  } catch {
    return false;
  }
}

// api.whatsapp.com rather than wa.me: wa.me's redirect to WhatsApp Web turns
// emojis into "?" boxes.
function whatsappUrl(message) {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

let toastEl = null;

// Small self-contained notice — neither panel ships a toast library.
function showToast(text, action) {
  toastEl?.remove();
  const el = document.createElement("div");
  el.setAttribute("role", "status");
  el.style.cssText =
    "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9999;" +
    "display:flex;align-items:center;gap:12px;max-width:calc(100vw - 32px);" +
    "padding:12px 16px;border-radius:12px;background:#111827;color:#fff;" +
    "font:500 14px/1.4 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25)";
  const label = document.createElement("span");
  label.textContent = text;
  el.appendChild(label);
  if (action) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = action.label;
    btn.style.cssText =
      "flex-shrink:0;padding:6px 12px;border:none;border-radius:8px;" +
      "background:#25D366;color:#fff;font:600 13px system-ui,sans-serif;cursor:pointer";
    btn.onclick = () => {
      el.remove();
      action.onClick();
    };
    el.appendChild(btn);
  }
  document.body.appendChild(el);
  toastEl = el;
  setTimeout(() => el.remove(), action ? 12000 : 6000);
}

/** Opens WhatsApp in a new tab; false if the browser blocked the popup. */
function openWhatsApp(message) {
  // No "noopener" feature: it makes window.open return null even on success
  const win = window.open(whatsappUrl(message), "_blank");
  if (!win) return false;
  win.opener = null;
  return true;
}

// After an await the click may have "expired" and the popup gets blocked;
// then the toast's button gives the user a fresh click to open WhatsApp.
function openWhatsAppOrOffer(message, notice) {
  if (openWhatsApp(message)) {
    if (notice) showToast(notice);
    return;
  }
  showToast(notice || "Ready to send on WhatsApp.", {
    label: "Open WhatsApp",
    onClick: () => openWhatsApp(message),
  });
}

/**
 * Sends the property photo + summary over WhatsApp, like the mobile app.
 *
 * - Browsers that can share files (phones, Safari, Chrome/Edge on Windows &
 *   macOS): the system share sheet opens with the photo and message attached —
 *   pick WhatsApp, then the client.
 * - Others (e.g. Firefox): the photo is copied to the clipboard and WhatsApp
 *   opens with the message; paste (Ctrl/⌘+V) in the chat to attach the photo.
 */
export async function sharePropertyOnWhatsApp(property) {
  const message = buildPropertyShareText(property);
  if (!message) return;
  const photoUrl = getPropertyPhotoUrl(property);
  refreshPropertyPreview(property);

  if (photoUrl && canShareFiles()) {
    const photo = await photoAsFile(property, photoUrl);
    const data = photo ? { files: [photo], text: message } : { text: message };
    if (navigator.canShare(data)) {
      try {
        await navigator.share(data);
        return;
      } catch (err) {
        if (err?.name === "AbortError") return; // user closed the sheet
        if (err?.name === "NotAllowedError") {
          // The photo took too long and the click "expired"; it's downloaded
          // now, so one more click shares instantly.
          showToast("Photo ready to share.", {
            label: "Share on WhatsApp",
            onClick: () => navigator.share(data).catch(() => {}),
          });
          return;
        }
      }
    }
  }

  if (photoUrl && navigator.clipboard?.write && window.ClipboardItem) {
    try {
      // Pass the promise so the copy still counts as part of the click
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": photoAsPng(photoUrl) }),
      ]);
      const pasteKey = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘V" : "Ctrl+V";
      openWhatsAppOrOffer(
        message,
        `Photo copied — press ${pasteKey} in the WhatsApp chat to attach it.`
      );
      return;
    } catch {
      // Photo couldn't be fetched or copied — send the text with its link preview
    }
  }

  openWhatsAppOrOffer(message);
}
