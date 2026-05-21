const multer = require("multer");
const cloudinary = require("cloudinary");
const fs = require("fs");

const upload = multer({ storage: multer.memoryStorage() });

const CLOUDINARY_ENABLED =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (CLOUDINARY_ENABLED) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("Cloudinary configured:", process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log("Cloudinary not configured — falling back to local uploads");
}

const UPLOAD_TIMEOUT_MS = 30000;

async function uploadFileToCloudinary(source, options = {}) {
  if (!CLOUDINARY_ENABLED) {
    console.warn("[cloudinary] not enabled — skipping upload");
    return null;
  }

  if (typeof source === "string") {
    try {
      console.log(`[cloudinary] uploading file path: ${source}`);
      const res = await cloudinary.uploader.upload(source, options);
      try {
        if (fs.existsSync(source)) fs.unlinkSync(source);
      } catch (e) {
        console.warn("Could not remove temp file:", source, e.message);
      }
      console.log(`[cloudinary] upload OK: ${res.public_id}`);
      return { url: res.secure_url, public_id: res.public_id };
    } catch (err) {
      console.error("[cloudinary] upload failed:", err.message || err);
      return null;
    }
  }

  if (source && source.buffer) {
    const sizeKB = Math.round(source.buffer.length / 1024);
    const origName = source.originalname || "unknown";
    console.log(`[cloudinary] uploading buffer: ${origName} (${sizeKB}KB)`);
    const t0 = Date.now();

    return new Promise((resolve, reject) => {
      let settled = false;
      const settle = (fn, val) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        fn(val);
      };

      const timer = setTimeout(() => {
        settle(reject, new Error(`Cloudinary upload timed out after ${UPLOAD_TIMEOUT_MS}ms for ${origName}`));
      }, UPLOAD_TIMEOUT_MS);

      try {
        const stream = cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error) return settle(reject, error);
            if (!result || !result.secure_url) {
              return settle(reject, new Error("Cloudinary returned no result"));
            }
            const dt = Date.now() - t0;
            console.log(`[cloudinary] upload OK: ${result.public_id} (${dt}ms)`);
            settle(resolve, { url: result.secure_url, public_id: result.public_id });
          }
        );
        stream.on("error", (err) => settle(reject, err));
        stream.end(source.buffer);
      } catch (syncErr) {
        settle(reject, syncErr);
      }
    }).catch((err) => {
      console.error(`[cloudinary] upload_stream failed for ${origName}:`, err.message || err);
      return null;
    });
  }

  console.warn("[cloudinary] unsupported source type:", typeof source, source && Object.keys(source));
  return null;
}

function extractCloudinaryPublicId(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    const uploadIndex = parts.findIndex((p) => p === "upload");
    if (uploadIndex === -1) return null;
    let publicPath = parts.slice(uploadIndex + 1).join("/");
    publicPath = publicPath.replace(/\.[a-zA-Z0-9]+$/, "");
    return publicPath;
  } catch (e) {
    return null;
  }
}

module.exports = {
  upload,
  cloudinary,
  CLOUDINARY_ENABLED,
  uploadFileToCloudinary,
  extractCloudinaryPublicId,
};
