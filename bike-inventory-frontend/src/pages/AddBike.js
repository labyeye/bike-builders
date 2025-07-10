import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Close, AddCircle, Error as ErrorIcon } from "@mui/icons-material";
import Sidebar from "../components/Layout/Sidebar";
import "../css/Dashboard.css";

const AddBike = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    modelYear: "",
    kmDriven: "",
    ownership: "",
    fuelType: "",
    daysOld: "",
    price: "",
    downPayment: "",
    imageUrl: ["", "", "", "", ""],
    status: "",
  });
  const [error, setError] = useState(null);
  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...formData.imageUrl];
    newImageUrls[index] = value;
    setFormData((prev) => ({
      ...prev,
      imageUrl: newImageUrls,
    }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Updated handleSubmit function for AddBike.js
const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null); // Clear previous errors

  try {
    // Check authentication first
    const authResponse = await fetch("https://bike-builders.onrender.com/api/admin/check-auth", {
      method: "GET",
      credentials: "include",
    });

    if (!authResponse.ok) {
      setError("Please login first");
      navigate("/admin/login");
      return;
    }

    const authData = await authResponse.json();
    if (!authData.isAuthenticated) {
      setError("Please login first");
      navigate("/admin/login");
      return;
    }

    // Filter out empty image URLs before sending
    const filteredImageUrls = formData.imageUrl.filter(url => url && url.trim() !== "");
    
    const dataToSend = {
      ...formData,
      imageUrl: filteredImageUrls, // Send as imageUrl to match backend expectation
    };

    const response = await fetch("https://bike-builders.onrender.com/api/admin/bike", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add bike");
    }

    const result = await response.json();
    if (result.success) {
      navigate("/admin/dashboard");
    } else {
      setError(result.error || "Failed to add bike");
    }
  } catch (err) {
    console.error("Error adding bike:", err);
    setError(err.message || "An error occurred while adding the bike");
  }
};

  return (
    <div className="app-container">
      <Sidebar user={user || { role: "staff" }} />
      <div className="main-content">
        <div className="card">
          <div className="card-header">
            <h2>Add New Bike</h2>
            <button
              className="btn icon-btn"
              onClick={() => navigate("/admin/dashboard")}
            >
              <Close />
            </button>
          </div>

          <div className="card-body">
            {error && (
              <div
                className="alert error"
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0.75rem 1rem",
                  backgroundColor: "#fff5f5",
                  color: "#e53e3e",
                  borderRadius: "8px",
                  marginBottom: "1.5rem",
                }}
              >
                <ErrorIcon style={{ marginRight: "8px" }} />
                {error}
              </div>
            )}

            <form id="addBikeForm" onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div className="form-group">
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                      color: "#2d3748",
                    }}
                  >
                    Brand <span style={{ color: "#e53e3e" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="brand"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                    }}
                    required
                    value={formData.brand}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                      color: "#2d3748",
                    }}
                  >
                    Model <span style={{ color: "#e53e3e" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                    }}
                    required
                    value={formData.model}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div className="form-group">
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                      color: "#2d3748",
                    }}
                  >
                    Model Year <span style={{ color: "#e53e3e" }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="modelYear"
                    min="2000"
                    max="2024"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                    }}
                    required
                    value={formData.modelYear}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                      color: "#2d3748",
                    }}
                  >
                    KM Driven <span style={{ color: "#e53e3e" }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="kmDriven"
                    min="0"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                    }}
                    required
                    value={formData.kmDriven}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div className="form-group">
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                      color: "#2d3748",
                    }}
                  >
                    Ownership <span style={{ color: "#e53e3e" }}>*</span>
                  </label>
                  <select
                    name="ownership"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                      backgroundColor: "white",
                      appearance: "none",
                      backgroundImage:
                        'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131A20%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.7rem top 50%",
                      backgroundSize: "0.65rem auto",
                    }}
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
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                      color: "#2d3748",
                    }}
                  >
                    Fuel Type <span style={{ color: "#e53e3e" }}>*</span>
                  </label>
                  <select
                    name="fuelType"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                      backgroundColor: "white",
                      appearance: "none",
                      backgroundImage:
                        'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131A20%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.7rem top 50%",
                      backgroundSize: "0.65rem auto",
                    }}
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

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div className="form-group">
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                      color: "#2d3748",
                    }}
                  >
                    Days Old <span style={{ color: "#e53e3e" }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="daysOld"
                    min="0"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                    }}
                    required
                    value={formData.daysOld}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div className="form-group">
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                      color: "#2d3748",
                    }}
                  >
                    Price (₹) <span style={{ color: "#e53e3e" }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                    }}
                    required
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                      color: "#2d3748",
                    }}
                  >
                    Down Payment (₹) <span style={{ color: "#e53e3e" }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="downPayment"
                    min="0"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                    }}
                    required
                    value={formData.downPayment}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                    color: "#2d3748",
                  }}
                >
                  Image URLs (Up to 5)
                </label>
                {[0, 1, 2, 3, 4].map((index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder={`Image URL ${index + 1} (optional)`}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                      marginBottom: "0.5rem",
                    }}
                    value={formData.imageUrl[index]}
                    onChange={(e) =>
                      handleImageUrlChange(index, e.target.value)
                    }
                  />
                ))}
                <small
                  style={{
                    display: "block",
                    marginTop: "0.5rem",
                    color: "#718096",
                    fontSize: "0.875rem",
                  }}
                >
                  You can add up to 5 images for the bike
                </small>
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                    color: "#2d3748",
                  }}
                >
                  Status <span style={{ color: "#e53e3e" }}>*</span>
                </label>
                <select
                  name="status"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    transition: "border-color 0.2s",
                    backgroundColor: "white",
                    appearance: "none",
                    backgroundImage:
                      'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131A20%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.7rem top 50%",
                    backgroundSize: "0.65rem auto",
                  }}
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

          <div
            className="card-footer"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "1rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid #edf2f7",
            }}
          >
            <button
              type="button"
              className="btn"
              style={{
                backgroundColor: "transparent",
                color: "#4a5568",
                border: "1px solid #e2e8f0",
              }}
              onClick={() => navigate("/admin/dashboard")}
            >
              <Close style={{ fontSize: "1rem", marginRight: "0.5rem" }} />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              form="addBikeForm"
              className="btn primary"
              style={{
                backgroundColor: "#4299e1",
                color: "white",
                border: "none",
              }}
            >
              <AddCircle style={{ fontSize: "1rem", marginRight: "0.5rem" }} />
              <span>Add Bike</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBike;
