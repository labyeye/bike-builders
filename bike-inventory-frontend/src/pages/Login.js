import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff, Person, Lock } from "@mui/icons-material";
import logo from "../assets/Logo.png";
import { setToken } from "../utils/auth";

const API = "https://backend.bikebuilders.in";

export default function AdminLogin({ setUser }) {
  const navigate = useNavigate();
  const [form, setForm]             = useState({ username: "", password: "" });
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const r = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Login failed");
      if (data.token) setToken(data.token);
      if (setUser && data.user) {
        try { localStorage.setItem("bb_user", JSON.stringify(data.user)); } catch (e) {}
        setUser(data.user);
      }
      navigate("/admin/dashboard");
    } catch(err) {
      setError(err.message || "An error occurred");
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight:"100vh", display:"flex",
      background:"linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)",
      alignItems:"center", justifyContent:"center", padding:16,
      fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",
    }}>
      <div style={{
        width:"100%", maxWidth:420,
        background:"#ffffff",
        borderRadius:16,
        boxShadow:"0 20px 60px rgb(37 99 235 / .12), 0 4px 16px rgb(0 0 0 / .06)",
        overflow:"hidden",
      }}>
        {}
        <div style={{
          background:"linear-gradient(135deg, #2563eb, #1d4ed8)",
          padding:"36px 32px 28px",
          textAlign:"center",
        }}>
          <div style={{
            width:64, height:64, borderRadius:16,
            background:"rgba(255,255,255,.18)",
            display:"inline-flex", alignItems:"center", justifyContent:"center",
            marginBottom:16,
          }}>
            <img src={logo} alt="Bike Builders" style={{width:48, height:48, objectFit:"contain"}}/>
          </div>
          <h1 style={{color:"#fff",fontSize:22,fontWeight:700,margin:"0 0 4px"}}>Admin Panel</h1>
          <p style={{color:"rgba(255,255,255,.75)",fontSize:13,margin:0}}>Sign in to your account</p>
        </div>

        {}
        <div style={{padding:"28px 32px 32px"}}>
          {error && (
            <div style={{
              background:"#fef2f2", border:"1px solid #fecaca",
              borderRadius:8, padding:"10px 14px",
              color:"#dc2626", fontSize:13, marginBottom:16,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} autoComplete="on">
            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:13,fontWeight:500,color:"#475569",marginBottom:6}}>Username</label>
              <div style={{position:"relative"}}>
                <Person style={{
                  position:"absolute", left:10, top:"50%", transform:"translateY(-50%)",
                  color:"#94a3b8", fontSize:20,
                }}/>
                <input
                  name="username" type="text"
                  value={form.username} onChange={handleChange}
                  required autoComplete="username"
                  placeholder="Enter username"
                  style={{
                    width:"100%", padding:"10px 12px 10px 38px",
                    border:"1px solid #e2e8f0", borderRadius:8,
                    fontSize:14, color:"#0f172a", background:"#f8fafc",
                    boxSizing:"border-box", transition:"border-color .15s",
                    outline:"none",
                  }}
                  onFocus={e=>e.target.style.borderColor="#2563eb"}
                  onBlur={e=>e.target.style.borderColor="#e2e8f0"}
                />
              </div>
            </div>

            <div style={{marginBottom:24}}>
              <label style={{display:"block",fontSize:13,fontWeight:500,color:"#475569",marginBottom:6}}>Password</label>
              <div style={{position:"relative"}}>
                <Lock style={{
                  position:"absolute", left:10, top:"50%", transform:"translateY(-50%)",
                  color:"#94a3b8", fontSize:20,
                }}/>
                <input
                  name="password" type={showPw ? "text" : "password"}
                  value={form.password} onChange={handleChange}
                  required autoComplete="current-password"
                  placeholder="Enter password"
                  style={{
                    width:"100%", padding:"10px 40px 10px 38px",
                    border:"1px solid #e2e8f0", borderRadius:8,
                    fontSize:14, color:"#0f172a", background:"#f8fafc",
                    boxSizing:"border-box", transition:"border-color .15s",
                    outline:"none",
                  }}
                  onFocus={e=>e.target.style.borderColor="#2563eb"}
                  onBlur={e=>e.target.style.borderColor="#e2e8f0"}
                />
                <button
                  type="button" onClick={()=>setShowPw(p=>!p)}
                  style={{
                    position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                    background:"none", border:"none", cursor:"pointer",
                    color:"#94a3b8", display:"flex", alignItems:"center",
                  }}
                >
                  {showPw ? <VisibilityOff style={{fontSize:20}}/> : <Visibility style={{fontSize:20}}/>}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width:"100%", padding:"11px",
                background: loading ? "#93c5fd" : "#2563eb",
                color:"#fff", border:"none", borderRadius:8,
                fontSize:14, fontWeight:600, cursor: loading ? "not-allowed" : "pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                transition:"background .15s",
              }}
            >
              {loading && (
                <span style={{
                  width:16, height:16,
                  border:"2px solid rgba(255,255,255,.4)",
                  borderTopColor:"#fff",
                  borderRadius:"50%",
                  animation:"spin .6s linear infinite",
                  display:"inline-block",
                }}/>
              )}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    </div>
  );
}
