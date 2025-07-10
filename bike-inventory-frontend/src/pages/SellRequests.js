import React, { useState, useEffect } from 'react';
import {
  Check,
  Close,
  Visibility,
  Sell
} from '@mui/icons-material';

const SellRequests = ({ user }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/sell-requests');
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error('Error fetching sell requests:', error);
      }
    };
    
    fetchRequests();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/sell-requests/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
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
    <div className="table-container">
      <div className="table-header">
        <h1 className="table-title">Sell Requests</h1>
      </div>

      <div className="table-body">
        <table>
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
            {requests.map(request => (
              <tr key={request._id}>
                <td>
                  <strong>{request.brand}</strong><br />
                  {request.model}
                </td>
                <td>
                  {request.sellerName}<br />
                  {request.sellerPhone}<br />
                  {request.sellerEmail}
                </td>
                <td>₹{request.expectedPrice.toLocaleString()}</td>
                <td>
                  {request.images && request.images.length > 0 ? (
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {request.images.map((image, index) => (
                        <img
                          key={index}
                          src={`/uploads/${image}`}
                          style={{
                            maxWidth: '50px',
                            maxHeight: '50px',
                            cursor: 'pointer',
                          }}
                          onClick={() => window.open(`/uploads/${image}`, '_blank')}
                          alt={`Bike ${index + 1}`}
                        />
                      ))}
                    </div>
                  ) : (
                    'No images'
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
                        >
                          <Check className="btn-icon" />
                          <span>Approve</span>
                        </button>
                        <button 
                          className="btn btn-error btn-sm"
                          onClick={() => updateStatus(request._id, 'Rejected')}
                        >
                          <Close className="btn-icon" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    <button className="btn btn-primary btn-sm">
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
  );
};

export default SellRequests;