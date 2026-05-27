import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  DirectionsBike, CheckCircle, Cancel, BookOnline,
  Add, Edit, Delete, Search, FilterList,
} from "@mui/icons-material";
import StatsCard from "../components/common/StatsCard";
import BikeFormModal from "../components/common/BikeFormModal";
import Sidebar from "../components/Layout/Sidebar";
import Topbar from "../components/Layout/Topbar";
import { authHeaders } from "../utils/auth";
import "../css/Dashboard.css";

const API = "https://backend.bikebuilders.in";

const BRANDS = ["All Brands","Hero","Honda","Bajaj","Yamaha","TVS","Royal Enfield","KTM","Suzuki","Ola","Ather","Other"];
const FUEL   = ["All Fuel","Petrol","Electric"];
const STATUS = ["All Status","Available","Coming Soon","Sold Out"];
const SORT   = [
  { label: "Newest First",     val: "newest" },
  { label: "Price: Low–High",  val: "price-asc" },
  { label: "Price: High–Low",  val: "price-desc" },
  { label: "KM: Low–High",     val: "km-asc" },
  { label: "Year: Newest",     val: "year-desc" },
];

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [bikes, setBikes]             = useState([]);
  const [stats, setStats]             = useState({ total:0, available:0, comingSoon:0, sold:0 });
  const [bookingCount, setBookingCount] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError]     = useState("");


  const [search, setSearch]   = useState("");
  const [brand,  setBrand]    = useState("All Brands");
  const [fuel,   setFuel]     = useState("All Fuel");
  const [status, setStatus]   = useState("All Status");
  const [sortBy, setSortBy]   = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minYear,  setMinYear]  = useState("");
  const [maxYear,  setMaxYear]  = useState("");


  const [modalOpen, setModalOpen]   = useState(false);
  const [editingBike, setEditingBike] = useState(null);

  const openAddModal  = () => { setEditingBike(null); setModalOpen(true); };
  const openEditModal = (bike) => { setEditingBike(bike); setModalOpen(true); };
  const closeModal    = () => { setModalOpen(false); setEditingBike(null); };

  const refreshBikes = async () => {
    try {
      const r = await fetch(`${API}/api/bikes`);
      if (!r.ok) return;
      const d = await r.json();
      const list = d.bikes || [];
      setBikes(list);
      setStats({
        total: list.length,
        available: list.filter(b => b.status === "Available").length,
        comingSoon: list.filter(b => b.status === "Coming Soon").length,
        sold: list.filter(b => b.status === "Sold Out").length,
      });
    } catch {}
  };

  useEffect(() => {
    // If user is passed from App.js (restored from localStorage), trust it immediately
    if (user) {
      setAuthChecked(true);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    (async () => {
      try {
        const r = await fetch(`${API}/api/check-auth`, {
          headers: authHeaders(),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!r.ok) return navigate("/login");
        const d = await r.json();
        if (!d.isAuthenticated) return navigate("/login");
        setAuthChecked(true);
      } catch (err) {
        clearTimeout(timeoutId);
        // On timeout, check localStorage before giving up
        try {
          const stored = localStorage.getItem("bb_user");
          if (stored && JSON.parse(stored)) {
            setAuthChecked(true);
            return;
          }
        } catch (e) {}
        if (err.name === "AbortError") {
          setAuthError("Server is taking too long to respond. Please check your connection and try again.");
          setLoading(false);
        } else {
          navigate("/login");
        }
      }
    })();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [navigate, user]);

  useEffect(() => {
    if (!authChecked) return;
    (async () => {
      try {
        setLoading(true);
        const [bikesRes, bookRes] = await Promise.allSettled([
          fetch(`${API}/api/bikes`),
          fetch(`${API}/api/bookings`, { headers: authHeaders() }),
        ]);
        if (bikesRes.status === "fulfilled" && bikesRes.value.ok) {
          const data = await bikesRes.value.json();
          const list = data.bikes || [];
          setBikes(list);
          setStats({
            total: list.length,
            available: list.filter(b => b.status === "Available").length,
            comingSoon: list.filter(b => b.status === "Coming Soon").length,
            sold: list.filter(b => b.status === "Sold Out").length,
          });
        }
        if (bookRes.status === "fulfilled" && bookRes.value.ok) {
          const bd = await bookRes.value.json();
          setBookingCount(Array.isArray(bd.bookings) ? bd.bookings.length : 0);
        }
      } finally { setLoading(false); }
    })();
  }, [authChecked]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bike?")) return;
    const r = await fetch(`${API}/api/bike/${id}`, { method:"DELETE", headers: authHeaders() });
    if (r.ok) setBikes(p => p.filter(b => b._id !== id));
  };

  const filtered = useMemo(() => {
    let list = [...bikes];
    if (search)            list = list.filter(b => `${b.brand} ${b.model}`.toLowerCase().includes(search.toLowerCase()));
    if (brand !== "All Brands")  list = list.filter(b => b.brand === brand);
    if (fuel  !== "All Fuel")    list = list.filter(b => b.fuelType === fuel);
    if (status !== "All Status") list = list.filter(b => b.status === status);
    if (minPrice) list = list.filter(b => (b.price||0) >= Number(minPrice));
    if (maxPrice) list = list.filter(b => (b.price||0) <= Number(maxPrice));
    if (minYear)  list = list.filter(b => (b.modelYear||0) >= Number(minYear));
    if (maxYear)  list = list.filter(b => (b.modelYear||0) <= Number(maxYear));
    switch (sortBy) {
      case "price-asc":  list.sort((a,b) => (a.price||0)-(b.price||0)); break;
      case "price-desc": list.sort((a,b) => (b.price||0)-(a.price||0)); break;
      case "km-asc":     list.sort((a,b) => (a.kmDriven||0)-(b.kmDriven||0)); break;
      case "year-desc":  list.sort((a,b) => (b.modelYear||0)-(a.modelYear||0)); break;
      default: break;
    }
    return list;
  }, [bikes, search, brand, fuel, status, sortBy, minPrice, maxPrice, minYear, maxYear]);

  const resetFilters = () => {
    setSearch(""); setBrand("All Brands"); setFuel("All Fuel");
    setStatus("All Status"); setSortBy("newest");
    setMinPrice(""); setMaxPrice(""); setMinYear(""); setMaxYear("");
  };

  const fmt = (p) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:0}).format(p);
  const badgeClass = (s) => s==="Available"?"badge-green":s==="Coming Soon"?"badge-yellow":"badge-red";

  if (authError) {
    return (
      <div className="loading" style={{ flexDirection: "column", gap: 16, padding: 24, textAlign: "center" }}>
        <div style={{ color: "#d32f2f", fontSize: 15, maxWidth: 380 }}>{authError}</div>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: "10px 22px", background: "#a32919", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}
        >
          Retry
        </button>
      </div>
    );
  }
  if (!authChecked || loading) return <div className="loading">Loading dashboard…</div>;

  return (
    <div className="app-bg"><div className="bg-circle-mid" /><div className="app-container">
      <Sidebar user={user || { role: "staff" }} />
      <div className="main-content">
        <Topbar user={user} />
        <div className="content-inner">

          <div className="page-header">
            <div>
              <h1>Bike Inventory</h1>
              <div className="page-subtitle">Manage all bikes, track status and availability</div>
            </div>
            <div className="header-actions">
              <button className="btn primary" onClick={openAddModal}>
                <Add style={{fontSize:18}}/> Add Bike
              </button>
            </div>
          </div>

          <div className="stats-grid">
            <StatsCard title="Total Bikes"     value={stats.total}      icon={<DirectionsBike/>} color="primary" />
            <StatsCard title="Available"       value={stats.available}  icon={<CheckCircle/>}    color="success" />
            <StatsCard title="Sold Out"        value={stats.sold}       icon={<Cancel/>}         color="error"   />
            <StatsCard title="Bookings"        value={bookingCount}     icon={<BookOnline/>}      color="warning" />
          </div>

          {}
          <div className="filter-bar">
            <FilterList style={{color:"var(--text-muted)",fontSize:18,flexShrink:0}}/>
            <div className="filter-search">
              <Search/>
              <input
                placeholder="Search brand or model…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="filter-select" value={brand}  onChange={e => setBrand(e.target.value)}>
              {BRANDS.map(b => <option key={b}>{b}</option>)}
            </select>
            <select className="filter-select" value={status} onChange={e => setStatus(e.target.value)}>
              {STATUS.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={fuel}   onChange={e => setFuel(e.target.value)}>
              {FUEL.map(f => <option key={f}>{f}</option>)}
            </select>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              <span className="filter-label">₹</span>
              <input className="filter-input" placeholder="Min price" value={minPrice} onChange={e=>setMinPrice(e.target.value)} type="number"/>
              <span className="filter-label">–</span>
              <input className="filter-input" placeholder="Max price" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} type="number"/>
            </div>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              <span className="filter-label">Year</span>
              <input className="filter-input" placeholder="From" value={minYear} onChange={e=>setMinYear(e.target.value)} type="number" style={{width:76}}/>
              <span className="filter-label">–</span>
              <input className="filter-input" placeholder="To"   value={maxYear} onChange={e=>setMaxYear(e.target.value)} type="number" style={{width:76}}/>
            </div>
            <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              {SORT.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
            </select>
            <button className="filter-reset" onClick={resetFilters}>Reset</button>
            <span className="filter-count">{filtered.length} of {bikes.length}</span>
          </div>

          {}
          <div className="card">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Bike</th>
                    <th>Year</th>
                    <th>KM</th>
                    <th>Fuel</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan="8" style={{textAlign:"center",padding:32,color:"var(--text-muted)"}}>No bikes match your filters</td></tr>
                  ) : filtered.map(bike => (
                    <tr key={bike._id}>
                      <td data-label="Photo">
                        {bike.imageUrl?.[0]
                          ? <img src={bike.imageUrl[0]} alt={bike.model} className="thumb-img"/>
                          : <div className="thumb-placeholder">No img</div>}
                      </td>
                      <td data-label="Bike">
                        <div className="cell-main">{bike.brand} {bike.model}</div>
                      </td>
                      <td data-label="Year">{bike.modelYear}</td>
                      <td data-label="KM">{(bike.kmDriven||0).toLocaleString()} km</td>
                      <td data-label="Fuel">{bike.fuelType||"Petrol"}</td>
                      <td data-label="Price"><strong>{fmt(bike.price||0)}</strong></td>
                      <td data-label="Status">
                        <span className={`badge ${badgeClass(bike.status)}`}>{bike.status}</span>
                      </td>
                      <td data-label="Actions">
                        <div className="action-buttons">
                          {user?.role === "admin" ? (
                            <>
                              <button className="btn-icon-only" onClick={() => openEditModal(bike)} title="Edit">
                                <Edit style={{fontSize:16}}/>
                              </button>
                              <button className="btn-icon-only danger" onClick={() => handleDelete(bike._id)} title="Delete">
                                <Delete style={{fontSize:16}}/>
                              </button>
                            </>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>

    <BikeFormModal
      open={modalOpen}
      onClose={closeModal}
      onSaved={refreshBikes}
      editingBike={editingBike}
    />
  </div>
);
}
