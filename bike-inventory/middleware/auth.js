function isAuthenticated(req, res, next) {
  console.log("Auth check:", req.session.isAuthenticated, req.session.user);
  if (req.session.isAuthenticated) return next();
  res.status(401).json({ success: false, error: "Unauthorized" });
}

function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === "admin") return next();
  res.status(403).json({ success: false, error: "Access denied" });
}

module.exports = { isAuthenticated, isAdmin };
