import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Close,
  AddCircle,
  Error as ErrorIcon
} from '@mui/icons-material';

const AddBike = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    modelYear: '',
    kmDriven: '',
    ownership: '',
    fuelType: '',
    daysOld: '',
    price: '',
    downPayment: '',
    imageUrl: '',
    status: ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:2500/api/admin/bike', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add bike');
      }
      
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1 className="form-title">Add New Bike</h1>
        <button 
          type="button" 
          className="btn btn-outlined" 
          onClick={() => navigate('/admin/dashboard')}
        >
          <Close className="btn-icon" />
          <span>Cancel</span>
        </button>
      </div>
      
      <div className="form-body">
        {error && (
          <div className="alert error">
            <ErrorIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            {error}
          </div>
        )}
        
        <form id="addBikeForm" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Brand</label>
              <input 
                type="text" 
                name="brand" 
                className="form-control" 
                required 
                value={formData.brand}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label required">Model</label>
              <input 
                type="text" 
                name="model" 
                className="form-control" 
                required 
                value={formData.model}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Model Year</label>
              <input 
                type="number" 
                name="modelYear" 
                min="2000" 
                max="2024" 
                className="form-control" 
                required 
                value={formData.modelYear}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label required">KM Driven</label>
              <input 
                type="number" 
                name="kmDriven" 
                min="0" 
                className="form-control" 
                required 
                value={formData.kmDriven}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Ownership</label>
              <select 
                name="ownership" 
                className="form-control select" 
                required
                value={formData.ownership}
                onChange={handleChange}
              >
                <option value="">Select Ownership</option>
                <option value="1st Owner">1st Owner</option>
                <option value="2nd Owner">2nd Owner</option>
                <option value="3rd Owner">3rd Owner</option>
                <option value="4th Owner or more">4th Owner or more</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label required">Fuel Type</label>
              <select 
                name="fuelType" 
                className="form-control select" 
                required
                value={formData.fuelType}
                onChange={handleChange}
              >
                <option value="">Select Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="EV">Electric</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Days Old</label>
              <input 
                type="number" 
                name="daysOld" 
                min="0" 
                className="form-control" 
                required 
                value={formData.daysOld}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Price (₹)</label>
              <input 
                type="number" 
                name="price" 
                min="0" 
                className="form-control" 
                required 
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label required">Down Payment (₹)</label>
              <input 
                type="number" 
                name="downPayment" 
                min="0" 
                className="form-control" 
                required 
                value={formData.downPayment}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input 
              type="text" 
              name="imageUrl" 
              placeholder="https://example.com/bike-image.jpg" 
              className="form-control" 
              value={formData.imageUrl}
              onChange={handleChange}
            />
            <small style={{ display: 'block', marginTop: '4px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
              Optional field for bike image
            </small>
          </div>

          <div className="form-group">
            <label className="form-label required">Status</label>
            <select 
              name="status" 
              className="form-control select" 
              required
              value={formData.status}
              onChange={handleChange}
            >
              <option value="">Select Status</option>
              <option value="Available">Available</option>
              <option value="Coming Soon">Coming Soon</option>
              <option value="Sold Out">Sold Out</option>
            </select>
          </div>
        </form>
      </div>
      
      <div className="form-footer">
        <button 
          type="button" 
          className="btn btn-outlined" 
          onClick={() => navigate('/admin/dashboard')}
        >
          <Close className="btn-icon" />
          <span>Cancel</span>
        </button>
        <button type="submit" form="addBikeForm" className="btn btn-primary">
          <AddCircle className="btn-icon" />
          <span>Add Bike</span>
        </button>
      </div>
    </div>
  );
};

export default AddBike;