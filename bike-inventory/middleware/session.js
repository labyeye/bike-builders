const session = require("express-session");
const { MongoStore } = require("connect-mongo");

function buildSession() {
  return session({
    secret: process.env.SESSION_SECRET || "rgesda543",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 30 * 24 * 60 * 60,
      autoRemove: "native",
      touchAfter: 24 * 60 * 60,
    }),
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
    proxy: process.env.NODE_ENV === "production",
  });
}

module.exports = buildSession;
