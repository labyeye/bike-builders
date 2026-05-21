import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken, authHeaders } from "../utils/auth";

const Logout = ({ setUser }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await fetch(
          "https://backend.bikebuilders.in/api/logout",
          {
            method: "GET",
            headers: authHeaders(),
          },
        );
      } catch (err) {
        console.error("Logout request failed", err);
      } finally {
        if (setUser) setUser(null);
        clearToken();
        try {
          localStorage.removeItem("selectedLanguage");
          localStorage.removeItem("bb_user");
        } catch (e) {}
        navigate("/login");
      }
    };

    doLogout();
  }, [navigate, setUser]);

  return <div style={{ padding: 40 }}>Signing out...</div>;
};

export default Logout;
