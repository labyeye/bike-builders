import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Close,
  Visibility,
  Sell
} from '@mui/icons-material';
import Sidebar from '../components/Layout/Sidebar';
import '../css/Dashboard.css';

const SellRequests = ({ user }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('https://bike-builders-1.onrender.com/api/admin/check-auth', {
          credentials: 'include',
        });
        if (!response.ok) return navigate('/login');
        const data = await response.json();
        if (!data.isAuthenticated) return navigate('/login');
        setAuthChecked(true);
      } catch {
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!authChecked) return;
    const fetchRequests = async () => {
      try {
        const response = await fetch('https://bike-builders-1.onrender.com/api/admin/sell-requests', {
          credentials: 'include',
        });
        const data = await response.json();
        setRequests(data.requests || []);
      } catch (error) {
        console.error('Error fetching sell requests:', error);
      }
    };
    fetchRequests();
  }, [authChecked]);

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`https://bike-builders-1.onrender.com/api/sell-requests/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      setRequests(requests.map(request =>
        request._id === id ? { ...request, status } : request
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  return (
    <div className="app-container">
      <Sidebar user={user} />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Sell Requests</h1>
        </div>
        <div className="table-body">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Bike</th>
                <th>Seller</th>
                <th>Price</th>
                <th>Images</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request, idx) => (
                <tr key={request._id} className={idx % 2 === 0 ? 'table-row-striped' : ''}>
                  <td>
                    <strong>{request.brand}</strong><br />
                    {request.model}
                  </td>
                  <td>
                    {request.sellerName}<br />
                    {request.sellerPhone}<br />
                    {request.sellerEmail}
                  </td>
                  <td>₹{request.expectedPrice?.toLocaleString()}</td>
                  <td>
                    {request.images && request.images.length > 0 ? (
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {request.images.map((image, index) => (
                          <img
                            key={index}
                            src={`https://bike-builders-1.onrender.com/uploads/${image}`}
                            style={{
                              maxWidth: '50px',
                              maxHeight: '50px',
                              borderRadius: '6px',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                              cursor: 'pointer',
                              border: '1px solid #eee',
                            }}
                            onClick={() => window.open(`https://bike-builders-1.onrender.com/uploads/${image}`, '_blank')}
                            alt={`Bike ${index + 1}`}
                          />
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#aaa', fontStyle: 'italic' }}>No images</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {request.status === 'Pending' && (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => updateStatus(request._id, 'Approved')}
                            style={{ borderRadius: '6px' }}
                          >
                            <Check className="btn-icon" />
                            <span>Approve</span>
                          </button>
                          <button
                            className="btn btn-error btn-sm"
                            onClick={() => updateStatus(request._id, 'Rejected')}
                            style={{ borderRadius: '6px' }}
                          >
                            <Close className="btn-icon" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                      <button className="btn btn-primary btn-sm" style={{ borderRadius: '6px' }}>
                        <Visibility className="btn-icon" />
                        <span>View</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellRequests;