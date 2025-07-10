import React from 'react';
import { Person } from '@mui/icons-material';

const Topbar = ({ user }) => {
  return (
    <div className="topbar">
      <div className="user-menu">
        <span className="user-name">{user.username}</span>
        <div className="user-avatar">
          <Person />
        </div>
      </div>
    </div>
  );
};

export default Topbar;