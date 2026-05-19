import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../../css/Dashboard.css";

const Layout = ({ user }) => (
  <div className="app-bg">
    <div className="bg-circle-mid" />
    <div className="app-container">
      <Sidebar user={user} />
      <div className="main-content">
        <Topbar user={user} />
        <div className="content-inner">
          <Outlet />
        </div>
      </div>
    </div>
  </div>
);

export default Layout;
