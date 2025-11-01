import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  TwoWheeler,
  Dashboard,
  DirectionsBike,
  AddCircle,
  Sell,
  RequestQuote,
  People,
  Logout,
  Notifications,
  BookOnline
} from '@mui/icons-material';
import '../../css/Sidebar.css';

const DashSidebar = ({ user }) => {
  const [open, setOpen] = useState(false);

  const closeIfOpen = () => {
    if (open) setOpen(false);
  };

  return (
    <>
      <button
        className={`sidebar-hamburger ${open ? 'open' : ''}`}
        aria-label="Toggle sidebar"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
      >
        <span className="hamburger-icon">☰</span>
      </button>
      <div className={`sidebar ${open ? 'open' : ''}`}>
      <NavLink className="sidebar-brand" to="/admin/dashboard">
        <TwoWheeler className="sidebar-brand-icon" />
        <span className="sidebar-brand-text">Bike Inventory</span>
      </NavLink>
      
  <div className="nav-items" onClick={closeIfOpen}>
        <div className="nav-item">
          <NavLink className="nav-link" to="/admin/dashboard">
            <Dashboard />
            <span>Dashboard</span>
          </NavLink>
        </div>
        
        <div className="sidebar-divider"></div>
        
        <div className="sidebar-heading">Inventory</div>
        
        <div className="nav-item">
          <NavLink className="nav-link" to="/admin/dashboard">
            <DirectionsBike />
            <span>All Bikes</span>
          </NavLink>
        </div>
        
        <div className="nav-item">
          <NavLink className="nav-link" to="/admin/bike/add">
            <AddCircle />
            <span>Add Bike</span>
          </NavLink>
        </div>
        
        <div className="sidebar-divider"></div>
        
        <div className="sidebar-heading">Requests</div>
        
        <div className="nav-item">
          <NavLink className="nav-link" to="/admin/sell-requests">
            <Sell />
            <span>Sell Requests</span>
          </NavLink>
        </div>
        <div className="nav-item">
          <NavLink className="nav-link" to="/admin/quote-requests">
            <RequestQuote />
            <span>Buy Requests</span>
          </NavLink>
        </div>
        <div className="nav-item">
          <NavLink className="nav-link" to="/admin/bookings">
            <BookOnline />
            <span>Bookings</span>
          </NavLink>
        </div>
        
        {user.role === 'admin' && (
          <>
            <div className="sidebar-divider"></div>
            
            <div className="sidebar-heading">Admin</div>
            
            <div className="nav-item">
              <NavLink className="nav-link" to="/admin/updates">
                <Notifications />
                <span>Updates</span>
              </NavLink>
            </div>

            <div className="nav-item">
              <NavLink className="nav-link" to="/admin/staff">
                <People />
                <span>Manage Users</span>
              </NavLink>
            </div>
          </>
        )}
        
        <div className="nav-item">
          <NavLink className="nav-link" to="/admin/logout">
            <Logout />
            <span>Logout</span>
          </NavLink>
        </div>
  </div>
  </div>
  {/* overlay for mobile when sidebar is open */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default DashSidebar;