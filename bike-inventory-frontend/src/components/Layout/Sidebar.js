import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Dashboard, DirectionsBike,
  Sell, RequestQuote, BookOnline,
  Notifications, People, RateReview, Logout, Menu,
} from "@mui/icons-material";
import "../../css/Sidebar.css";
import logo from "../../assets/Logo.png";

export default function DashSidebar({ user }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      {}
      <button className={`sidebar-hamburger ${open?"open":""}`} aria-label="Toggle menu" onClick={()=>setOpen(s=>!s)}>
        <div className="hamburger-icon"><Menu style={{fontSize:20}}/></div>
        <span style={{fontSize:14,fontWeight:600,color:"var(--text)"}}>Bike Builders Admin</span>
      </button>

      <div className={`sidebar ${open?"open":""}`}>
        <NavLink className="sidebar-brand" to="/admin/dashboard" onClick={close}>
          <img src={logo} alt="Bike Builders"/>
        </NavLink>

        <nav className="nav-items" onClick={close}>
          <div className="nav-item">
            <NavLink className="nav-link" to="/admin/dashboard">
              <Dashboard/><span>Dashboard</span>
            </NavLink>
          </div>

          <div className="sidebar-divider"/>
          <div className="sidebar-heading">Inventory</div>
          <div className="nav-item">
            <NavLink className="nav-link" to="/admin/dashboard">
              <DirectionsBike/><span>All Bikes</span>
            </NavLink>
          </div>

          <div className="sidebar-divider"/>
          <div className="sidebar-heading">Requests</div>
          <div className="nav-item">
            <NavLink className="nav-link" to="/admin/sell-requests">
              <Sell/><span>Sell Requests</span>
            </NavLink>
          </div>
          <div className="nav-item">
            <NavLink className="nav-link" to="/admin/quote-requests">
              <RequestQuote/><span>Buy Requests</span>
            </NavLink>
          </div>
          <div className="nav-item">
            <NavLink className="nav-link" to="/admin/bookings">
              <BookOnline/><span>Bookings</span>
            </NavLink>
          </div>

          {user?.role === "admin" && (
            <>
              <div className="sidebar-divider"/>
              <div className="sidebar-heading">Admin</div>
              <div className="nav-item">
                <NavLink className="nav-link" to="/admin/updates">
                  <Notifications/><span>Updates</span>
                </NavLink>
              </div>
              <div className="nav-item">
                <NavLink className="nav-link" to="/admin/staff">
                  <People/><span>Manage Users</span>
                </NavLink>
              </div>
              <div className="nav-item">
                <NavLink className="nav-link" to="/admin/reviews">
                  <RateReview/><span>Reviews</span>
                </NavLink>
              </div>
            </>
          )}

          <div className="sidebar-divider"/>
          <div className="nav-item">
            <NavLink className="nav-link logout-link" to="/admin/logout">
              <Logout/><span>Logout</span>
            </NavLink>
          </div>
        </nav>
      </div>

      {open && <div className="sidebar-overlay" onClick={close} aria-hidden="true"/>}
    </>
  );
}
