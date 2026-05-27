const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const MAX_FILE_SIZE_MB = 10;
const MAX_FILES = 5;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: MAX_FILES,
  },
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    return cb(new Error(`Invalid file type: ${file.mimetype}. Only images allowed.`));
  },
});

const CLOUDINARY_ENABLED =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (CLOUDINARY_ENABLED) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log(
    "[cloudinary] configured for cloud:",
    process.env.CLOUDINARY_CLOUD_NAME,
  );
} else {
  console.log(
    "[cloudinary] NOT configured — uploads will fall back to local paths",
  );
}

const UPLOAD_TIMEOUT_MS = 30000;

async function uploadFileToCloudinary(source, options = {}) {
  if (!CLOUDINARY_ENABLED) {
    console.warn("[cloudinary] not enabled — skipping upload");
    return null;
  }

  const origName =
    (source && source.originalname) ||
    (typeof source === "string" ? source : "unknown");
  const t0 = Date.now();

  try {
    let uploadInput;

    if (typeof source === "string") {
      console.log(`[cloudinary] uploading file path: ${source}`);
      uploadInput = source;
    } else if (source && source.buffer) {
      const sizeKB = Math.round(source.buffer.length / 1024);
      const mime = source.mimetype || "image/jpeg";
      console.log(
        `[cloudinary] uploading buffer: ${origName} mime=${mime} (${sizeKB}KB)`,
      );
      uploadInput = `data:${mime};base64,${source.buffer.toString("base64")}`;
    } else {
      console.warn("[cloudinary] unsupported source type:", typeof source);
      return null;
    }

    const uploadPromise = cloudinary.uploader.upload(uploadInput, {
      resource_type: "image",
      ...options,
    });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `Cloudinary timeout after ${UPLOAD_TIMEOUT_MS}ms for ${origName}`,
            ),
          ),
        UPLOAD_TIMEOUT_MS,
      ),
    );

    const result = await Promise.race([uploadPromise, timeoutPromise]);

    const dt = Date.now() - t0;
    const secureUrl = result?.secure_url || result?.url;

    if (!secureUrl) {
      console.error(
        `[cloudinary] no URL in result for ${origName}:`,
        JSON.stringify(result),
      );
      return null;
    }

    console.log(
      `[cloudinary] ✅ upload OK: ${result.public_id} → ${secureUrl} (${dt}ms)`,
    );

    // Best-effort temp cleanup
    if (typeof source === "string") {
      try {
        if (fs.existsSync(source)) fs.unlinkSync(source);
      } catch (e) {
        console.warn(
          "[cloudinary] temp file cleanup failed:",
          source,
          e.message,
        );
      }
    }

    return { url: secureUrl, public_id: result.public_id };
  } catch (err) {
    const dt = Date.now() - t0;
    console.error(
      `[cloudinary] ❌ upload failed for ${origName} after ${dt}ms:`,
      err.message || err,
    );
    return null;
  }
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
