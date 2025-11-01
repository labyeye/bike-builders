import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DirectionsBike, Close, Error as ErrorIcon } from "@mui/icons-material";
import Sidebar from "../components/Layout/Sidebar";
import "../css/Dashboard.css";

const EditBike = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bike, setBike] = useState({
    brand: "",
    model: "",
    modelYear: "",
    kmDriven: "",
    ownership: "1st Owner",
    fuelType: "Petrol",
    daysOld: "",
    price: "",
    downPayment: "",
    imageUrl: ["", "", "", "", ""],
    status: "Available",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBike = async () => {
      try {
        const response = await fetch(
          `http://localhost:2500/api/admin/bike/${id}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch bike");
        }

        const data = await response.json();

        if (data.success && data.bike) {
          // Convert numeric fields to strings for the form inputs
          const formattedBike = {
            ...data.bike,
            modelYear: data.bike.modelYear.toString(),
            kmDriven: data.bike.kmDriven.toString(),
            daysOld: data.bike.daysOld.toString(),
            emiAvailable: data.bike.emiAvailable || false,
            emiAmount: data.bike.emiAmount?.toString() || "",
            ageValue: data.bike.daysOld?.toString() || "",
            ageUnit: "days",
            price: data.bike.price.toString(),
            downPayment: data.bike.downPayment.toString(),
            // Ensure imageUrl is an array with 5 elements
            imageUrl: Array.isArray(data.bike.imageUrl)
              ? [
                  ...data.bike.imageUrl,
                  ...Array(5 - data.bike.imageUrl.length).fill(""),
                ].slice(0, 5)
              : [data.bike.imageUrl || "", "", "", "", ""].slice(0, 5),
          };
          setBike(formattedBike);
        } else {
          throw new Error("Bike not found");
        }
      } catch (err) {
        console.error("Error fetching bike:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBike();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBike((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...bike.imageUrl];
    newImageUrls[index] = value;
    setBike((prev) => ({
      ...prev,
      imageUrl: newImageUrls,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Check authentication first
      const authResponse = await fetch(
        "http://localhost:2500/api/admin/check-auth",
        {
          method: "GET",
          credentials: "include",
        }
      );

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
      const filteredImageUrls = bike.imageUrl.filter(
        (url) => url && url.trim() !== ""
      );

      const bikeData = {
        ...bike,
        modelYear: Number(bike.modelYear),
        kmDriven: Number(bike.kmDriven),
        daysOld: Number(bike.daysOld),
        price: Number(bike.price),
        downPayment: Number(bike.downPayment),
        imageUrl: filteredImageUrls,
      };

      const response = await fetch(
        `http://localhost:2500/api/admin/bike/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(bikeData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update bike");
      }

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Error updating bike:", err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar user={user || { role: "staff" }} />
        <div className="main-content">
          <div className="loading">Loading bike details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <Sidebar user={user || { role: "staff" }} />
        <div className="main-content">
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
            <button
              className="btn primary"
              onClick={() => navigate("/admin/dashboard")}
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
      <Sidebar user={user || { role: "staff" }} />
      <div className="main-content">
        <div className="card">
          <div className="card-header">
            <h2>Edit Bike</h2>
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

            <form onSubmit={handleSubmit}>
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
                    value={bike.brand}
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
                    value={bike.model}
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
                    Model Year <span style={{ color: "#e53e3e" }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="modelYear"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                    }}
                    min="2000"
                    max={new Date().getFullYear()}
                    required
                    value={bike.modelYear}
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
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                    }}
                    min="0"
                    required
                    value={bike.kmDriven}
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
                    value={bike.ownership}
                    onChange={handleChange}
                  >
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
                    value={bike.fuelType}
                    onChange={handleChange}
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="EV">Electric</option>
                  </select>
                </div>

                <div className="form-group">
  <label>Age</label>
  <div style={{ display: "flex", gap: "0.5rem" }}>
    {/* Numeric Input */}
    <input
      type="number"
      min="0"
      value={bike.ageValue}
      onChange={handleChange}
      style={{
        flex: 1,
        padding: "0.75rem",
        border: "1px solid #e2e8f0",
        borderRadius: "8px"
      }}
    />
    
    {/* Unit Selector Buttons */}
    <div style={{ display: "flex" }}>
      {["days", "months", "years"].map((unit) => (
        <button
          key={unit}
          type="button"
          onClick={() => setBike({
            ...bike,
            ageUnit: unit
          })}
          style={{
            padding: "0 1rem",
            border: "1px solid #e2e8f0",
            backgroundColor: bike.ageUnit === unit ? "#4299e1" : "white",
            color: bike.ageUnit === unit ? "white" : "#4a5568",
            cursor: "pointer"
          }}
        >
          {unit.charAt(0).toUpperCase() + unit.slice(1)}
        </button>
      ))}
    </div>
  </div>
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
                    Price (₹) <span style={{ color: "#e53e3e" }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                    }}
                    min="0"
                    step="1000"
                    required
                    value={bike.price}
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
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                    }}
                    min="0"
                    step="1000"
                    required
                    value={bike.downPayment}
                    onChange={handleChange}
                  />
                </div>
                {/* EMI Availability */}
                <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={bike.emiAvailable}
                      onChange={handleChange}
                    />
                    <span>EMI Available</span>
                  </label>
                </div>

                {/* EMI Amount (shown only when EMI is available) */}
                {bike.emiAvailable && (
                  <div
                    className="form-group"
                    style={{ marginBottom: "1.5rem" }}
                  >
                    <label>Monthly EMI Amount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={bike.emiAmount}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                )}

                <div className="form-group" style={{ gridColumn: "span 2" }}>
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
                      value={bike.imageUrl[index] || ""}
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
                  {/* Show preview of the first image if available */}
                  {bike.imageUrl[0] && (
                    <div
                      className="image-preview"
                      style={{ marginTop: "0.5rem" }}
                    >
                      <img
                        src={bike.imageUrl[0]}
                        alt="Bike preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "200px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300";
                        }}
                      />
                    </div>
                  )}
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
                    value={bike.status}
                    onChange={handleChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Coming Soon">Coming Soon</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>
              </div>

              <div
                className="form-actions"
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
                  className="btn primary"
                  style={{
                    backgroundColor: "#4299e1",
                    color: "white",
                    border: "none",
                  }}
                >
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBike;
