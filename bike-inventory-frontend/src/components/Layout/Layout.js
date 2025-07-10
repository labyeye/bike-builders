import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ user }) => {
  return (
    <div className="app-container">
      <Sidebar user={user} />
      <div className="main-content">
        <Topbar user={user} />
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;