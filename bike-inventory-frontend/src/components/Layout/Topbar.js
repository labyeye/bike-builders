import React from "react";
import { Person } from "@mui/icons-material";

const Topbar = ({ user }) => (
  <div className="topbar">
    <div className="topbar-user">
      <div className="topbar-avatar"><Person /></div>
      <div>
        <div className="topbar-name">{user?.username || "Admin"}</div>
        <div className="topbar-role">{user?.role || "staff"}</div>
      </div>
    </div>
  </div>
);

export default Topbar;
