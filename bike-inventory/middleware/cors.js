const cors = require("cors");

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://www.bikebuilders.in",
  "https://bikebuilders-backend.vercel.app",
  "https://bike-builders-lfn5tcmcq-labyeyes-projects.vercel.app",
];

function buildCors() {
  if (process.env.NODE_ENV !== "production") {
    return cors({
      origin: true,
      credentials: true,
      optionsSuccessStatus: 200,
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Control-Allow-Credentials",
        "Access-Control-Allow-Origin",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    });
  }

  return cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      console.log("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Forwarded-Proto",
      "Access-Control-Allow-Credentials",
      "Access-Control-Allow-Origin",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });
}

module.exports = buildCors;
