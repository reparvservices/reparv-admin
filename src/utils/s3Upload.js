// Direct browser → S3 upload using the backend's signed URL endpoint.
// Uses XMLHttpRequest (not fetch) so large files like videos can report progress.

const safeFileName = (name) =>
  String(name || "file")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(-80);

/**
 * Uploads a file and resolves with its public S3 URL.
 * onProgress(percent) is called while the upload runs.
 */
export async function uploadFileToS3(URI, file, { folder = "uploads", onProgress } = {}) {
  const res = await fetch(`${URI}/api/s3/signed-url/get`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: safeFileName(file.name), fileType: file.type, folder }),
  });
  if (!res.ok) throw new Error("Could not start the upload");
  const { uploadUrl, fileUrl } = await res.json();

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
    xhr.send(file);
  });

  return fileUrl;
}
