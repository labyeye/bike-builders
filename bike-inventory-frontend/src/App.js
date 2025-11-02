import React, { useEffect, useState } from "react";
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
import Reviews from "./pages/Reviews";
import Logout from "./pages/Logout";

function App() {
  // You would typically manage user authentication state here
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check session on app load so user state persists across refresh
    const checkAuth = async () => {
      try {
        const res = await fetch("https://bike-builders-backend.vercel.app/api/admin/check-auth", {
          credentials: "include",
        });
        if (!res.ok) {
          setUser(null);
        } else {
          const data = await res.json();
          if (data.isAuthenticated && data.user) setUser(data.user);
          else setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  return (
    <Router>
      {authChecked ? (
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/admin/dashboard" /> : <AdminLogin setUser={setUser} />}
          />
          <Route
            path="/admin/dashboard"
            element={<BikeInventoryDashboard user={user} setUser={setUser} />}
          />
          <Route path="/admin/bookings" element={<Bookings user={user} />} />
          <Route path="/admin/bike/add" element={<AddBike user={user} />} />
          <Route path="/admin/bike/edit/:id" element={<EditBike user={user} />} />
          <Route
            path="/admin/sell-requests"
            element={<SellRequests user={user} />}
          />
          <Route path="/admin/updates" element={<Updates user={user} />} />
          <Route path="/admin/reviews" element={<Reviews user={user} />} />
          <Route
            path="/admin/quote-requests"
            element={<BuyRequests user={user} />}
          />
          <Route path="/admin/logout" element={<Logout setUser={setUser} />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        // you can show a spinner while auth is being checked
        <div style={{ padding: 40 }}>Checking authentication...</div>
      )}
    </Router>
  );
}

export default App;
