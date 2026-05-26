const cors = require("cors");

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://www.bikebuilders.in",
  "https://bikebuilders.in",
  "https://bikebuilders-backend.vercel.app",
];

const allowedHeaders = [
  "Accept",
  "Authorization",
  "Content-Type",
  "X-Requested-With",
  "X-Forwarded-Proto",
];

const exposedHeaders = ["X-Session-ID"];

const methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];

function buildCors() {
  if (process.env.NODE_ENV !== "production") {
    return cors({
      origin: true,
      credentials: true,
      optionsSuccessStatus: 204,
      allowedHeaders,
      exposedHeaders,
      methods,
    });
  }

  return cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // also allow any *.vercel.app preview deployment for this frontend
      if (/^https:\/\/bike-builders-.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      console.warn(`[cors] blocked origin: ${origin}`);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders,
    exposedHeaders,
    methods,
  });
}

module.exports = buildCors;
