import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  TwoWheeler,
  Dashboard,
  DirectionsBike,
  AddCircle,
  Sell,
  RequestQuote,
  People,
  Logout
} from '@mui/icons-material';

const DashSidebar = ({ user }) => {
  return (
    <div className="sidebar">
      <NavLink className="sidebar-brand" to="/admin/dashboard">
        <TwoWheeler className="sidebar-brand-icon" />
        <span className="sidebar-brand-text">Bike Inventory</span>
      </NavLink>
      
      <div className="nav-items">
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
        
        {user.role === 'admin' && (
          <>
            <div className="sidebar-divider"></div>
            
            <div className="sidebar-heading">Admin</div>
            
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
  );
};

export default DashSidebar;