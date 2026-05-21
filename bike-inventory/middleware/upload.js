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

async function uploadFileToCloudinary(source, options = {}) {
  if (!CLOUDINARY_ENABLED) return null;

  if (typeof source === "string") {
    try {
      const res = await cloudinary.uploader.upload(source, options);
      try {
        if (fs.existsSync(source)) fs.unlinkSync(source);
      } catch (e) {
        console.warn("Could not remove temp file:", source, e.message);
      }
      return { url: res.secure_url, public_id: res.public_id };
    } catch (err) {
      console.error("Cloudinary upload failed:", err.message || err);
      return null;
    }
  }

  if (source && source.buffer) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) return reject(error);
          resolve({ url: result.secure_url, public_id: result.public_id });
        }
      );
      stream.end(source.buffer);
    }).catch((err) => {
      console.error("Cloudinary upload_stream failed:", err.message || err);
      return null;
    });
  }

  console.warn("uploadFileToCloudinary received unsupported source", typeof source);
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
