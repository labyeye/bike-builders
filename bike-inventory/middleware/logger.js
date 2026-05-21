function requestLogger(req, res, next) {
  const start = Date.now();
  const ts = new Date().toISOString().slice(11, 23);
  const ip = req.ip || req.headers["x-forwarded-for"] || "—";
  const hasAuth = !!req.headers.authorization;
  const origin = req.headers.origin || "—";

  console.log(
    `[REQ ${ts}] ${req.method} ${req.originalUrl} | ip=${ip} | auth=${hasAuth} | origin=${origin}`
  );

  if (req.method !== "GET" && req.headers["content-type"]) {
    const ct = req.headers["content-type"];
    if (ct.includes("application/json") && req.body) {
      const safe = { ...req.body };
      if (safe.password) safe.password = "***";
      console.log(`[REQ ${ts}] body:`, safe);
    } else if (ct.includes("multipart/form-data")) {
      console.log(`[REQ ${ts}] multipart upload`);
    }
  }

  res.on("finish", () => {
    const duration = Date.now() - start;
    const ts2 = new Date().toISOString().slice(11, 23);
    const status = res.statusCode;
    const icon = status >= 500 ? "❌" : status >= 400 ? "⚠️" : "✅";
    console.log(
      `[RES ${ts2}] ${icon} ${req.method} ${req.originalUrl} → ${status} (${duration}ms)`
    );
  });

  next();
}

module.exports = requestLogger;
