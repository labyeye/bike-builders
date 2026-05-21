import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BikeInventoryDashboard from "./pages/Dashboard";
import SellRequests from "./pages/SellRequests";
import BuyRequests from "./pages/BuyRequests";
import AdminLogin from "./pages/Login";
import Bookings from "./pages/Bookings";
import Updates from "./pages/Updates";
import Reviews from "./pages/Reviews";
import Logout from "./pages/Logout";

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const setUserWithStorage = (u) => {
    if (u) {
      try { localStorage.setItem("bb_user", JSON.stringify(u)); } catch (e) {}
    } else {
      try { localStorage.removeItem("bb_user"); } catch (e) {}
    }
    setUser(u);
  };

  useEffect(() => {
    // Restore user from localStorage immediately (prevents logout on refresh)
    try {
      const stored = localStorage.getItem("bb_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          setUser(parsed);
          setAuthChecked(true);
        }
      }
    } catch (e) {}

    const checkAuth = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(
          "https://bike-builders-backend.vercel.app/api/admin/check-auth",
          {
            credentials: "include",
            signal: controller.signal,
          },
        );
        clearTimeout(timeout);
        if (!res.ok) {
          setUserWithStorage(null);
        } else {
          const data = await res.json();
          if (data.isAuthenticated && data.user) setUserWithStorage(data.user);
          else setUserWithStorage(null);
        }
      } catch (err) {
        // On timeout/network error, keep the localStorage user if present
        try {
          const stored = localStorage.getItem("bb_user");
          if (!stored) setUser(null);
        } catch (e) {
          setUser(null);
        }
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
            element={
              user ? (
                <Navigate to="/admin/dashboard" />
              ) : (
                <AdminLogin setUser={setUserWithStorage} />
              )
            }
          />
          <Route
            path="/admin/dashboard"
            element={<BikeInventoryDashboard user={user} setUser={setUserWithStorage} />}
          />
          <Route path="/admin/bookings" element={<Bookings user={user} />} />
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
          <Route path="/admin/logout" element={<Logout setUser={setUserWithStorage} />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <div style={{ padding: 40 }}>Checking authentication...</div>
      )}
    </Router>
  );
}

export default App;
