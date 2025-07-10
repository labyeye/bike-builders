import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DirectionsBike } from '@mui/icons-material';
import Sidebar from '../components/Layout/Sidebar';
import '../css/Dashboard.css';

const EditBike = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bike, setBike] = useState({
    brand: '',
    model: '',
    modelYear: '',
    kmDriven: '',
    ownership: '1st Owner',
    fuelType: 'Petrol',
    daysOld: '',
    price: '',
    downPayment: '',
    imageUrl: '',
    status: 'Available'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBike = async () => {
      try {
        const response = await fetch(`https://bike-builders.onrender.com/api/admin/bike/${id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch bike');
        }
        
        const data = await response.json();
        
        if (data.success && data.bike) {
          // Convert numeric fields to strings for the form inputs
          const formattedBike = {
            ...data.bike,
            modelYear: data.bike.modelYear.toString(),
            kmDriven: data.bike.kmDriven.toString(),
            daysOld: data.bike.daysOld.toString(),
            price: data.bike.price.toString(),
            downPayment: data.bike.downPayment.toString()
          };
          setBike(formattedBike);
        } else {
          throw new Error('Bike not found');
        }
      } catch (err) {
        console.error('Error fetching bike:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBike();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBike(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Convert string inputs back to numbers where needed
      const bikeData = {
        ...bike,
        modelYear: Number(bike.modelYear),
        kmDriven: Number(bike.kmDriven),
        daysOld: Number(bike.daysOld),
        price: Number(bike.price),
        downPayment: Number(bike.downPayment)
      };

      const response = await fetch(`https://bike-builders.onrender.com/api/admin/bike/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(bikeData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update bike');
      }
      
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Error updating bike:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar user={user} />
        <div className="main-content">
          <div className="loading">Loading bike details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <Sidebar user={user} />
        <div className="main-content">
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
            <button 
              className="btn primary" 
              onClick={() => navigate('/admin/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar user={user} />
      <div className="main-content">
        <div className="form-container">
          <div className="form-header">
            <DirectionsBike style={{ fontSize: 32, marginRight: 10 }} />
            <h2>Edit Bike</h2>
          </div>

          {error && <div className="alert error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Brand*</label>
                <input
                  type="text"
                  name="brand"
                  value={bike.brand}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Model*</label>
                <input
                  type="text"
                  name="model"
                  value={bike.model}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Model Year*</label>
                <input
                  type="number"
                  name="modelYear"
                  value={bike.modelYear}
                  onChange={handleChange}
                  min="2000"
                  max={new Date().getFullYear()}
                  required
                />
              </div>

              <div className="form-group">
                <label>KM Driven*</label>
                <input
                  type="number"
                  name="kmDriven"
                  value={bike.kmDriven}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Ownership*</label>
                <select
                  name="ownership"
                  value={bike.ownership}
                  onChange={handleChange}
                  required
                >
                  <option value="1st Owner">1st Owner</option>
                  <option value="2nd Owner">2nd Owner</option>
                  <option value="3rd Owner">3rd Owner</option>
                  <option value="4th Owner or more">4th Owner or more</option>
                </select>
              </div>

              <div className="form-group">
                <label>Fuel Type*</label>
                <select
                  name="fuelType"
                  value={bike.fuelType}
                  onChange={handleChange}
                  required
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="EV">Electric</option>
                </select>
              </div>

              <div className="form-group">
                <label>Days Old*</label>
                <input
                  type="number"
                  name="daysOld"
                  value={bike.daysOld}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Price (₹)*</label>
                <input
                  type="number"
                  name="price"
                  value={bike.price}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  required
                />
              </div>

              <div className="form-group">
                <label>Downpayment (₹)*</label>
                <input
                  type="number"
                  name="downPayment"
                  value={bike.downPayment}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  required
                />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={bike.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/bike-image.jpg"
                />
                {bike.imageUrl && (
                  <div className="image-preview">
                    <img src={bike.imageUrl} alt="Bike preview" onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300';
                    }} />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Status*</label>
                <select
                  name="status"
                  value={bike.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Available">Available</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="Sold Out">Sold Out</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={() => navigate('/admin/dashboard')}
              >
                Cancel
              </button>
              <button type="submit" className="btn primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBike;