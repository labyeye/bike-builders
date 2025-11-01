import React from "react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BikeInventoryDashboard from "./pages/Dashboard";
import AddBike from "./pages/AddBike";
import EditBike from "./pages/EditBike";
import SellRequests from "./pages/SellRequests";
import BuyRequests from "./pages/BuyRequests";
import AdminLogin from "./pages/Login";
import Bookings from "./pages/Bookings";
import Updates from "./pages/Updates";

function App() {
  // You would typically manage user authentication state here
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AdminLogin setUser={setUser} />} />
        <Route
          path="/admin/dashboard"
          element={<BikeInventoryDashboard user={user} />}
        />
        <Route path="/admin/bookings" element={<Bookings user={user} />} />
        <Route path="/admin/bike/add" element={<AddBike user={user} />} />
        <Route path="/admin/bike/edit/:id" element={<EditBike user={user} />} />
        <Route
          path="/admin/sell-requests"
          element={<SellRequests user={user} />}
        />
        <Route path="/admin/updates" element={<Updates user={user} />} />
        <Route
          path="/admin/quote-requests"
          element={<BuyRequests user={user} />}
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
