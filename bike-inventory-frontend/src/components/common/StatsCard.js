import React from "react";

const colorMap = { primary: "blue", success: "green", error: "red", warning: "orange" };

const StatsCard = ({ title, value, icon, color = "primary" }) => (
  <div className="stat-card">
    <div className={`stat-icon ${colorMap[color] || "blue"}`}>{icon}</div>
    <div className="stat-info">
      <div className="stat-value">{value !== null && value !== undefined ? value.toLocaleString?.() ?? value : "—"}</div>
      <div className="stat-label">{title}</div>
    </div>
  </div>
);

export default StatsCard;
