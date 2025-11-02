import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ setUser }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await fetch('https://bike-builders-backend.vercel.app/api/admin/logout', {
          method: 'GET',
          credentials: 'include',
        });
      } catch (err) {
        console.error('Logout request failed', err);
      } finally {
        if (setUser) setUser(null);
        // best-effort: clear localStorage tokens if any
        try { localStorage.removeItem('selectedLanguage'); } catch (e) {}
        navigate('/login');
      }
    };

    doLogout();
  }, [navigate, setUser]);

  return <div style={{ padding: 40 }}>Signing out...</div>;
};

export default Logout;
