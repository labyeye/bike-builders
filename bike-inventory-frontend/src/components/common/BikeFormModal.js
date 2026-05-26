import React, { useState, useEffect } from "react";
import { Close, Error as ErrorIcon, CloudUpload } from "@mui/icons-material";
import { authHeaders } from "../../utils/auth";
import UploadProgressModal from "./UploadProgressModal";

const API = "https://backend.bikebuilders.in";

const BRANDS = ["Hero","Honda","Bajaj","Yamaha","TVS","Royal Enfield","KTM","Suzuki","Other"];
const FUEL_TYPES = ["Petrol","Electric"];
const OWNERSHIP = ["1st","2nd","3rd","4th+"];
const STATUS_OPTIONS = ["Available","Coming Soon","Sold Out"];

const emptyForm = {
  brand: "", model: "", modelYear: "", kmDriven: "",
  ownership: "1st", fuelType: "Petrol",
  ageValue: "", ageUnit: "days",
  price: "", downPayment: "",
  emiAvailable: false, emiAmount: "",
  status: "Available", stock: 1,
};

export default function BikeFormModal({ open, onClose, onSaved, editingBike }) {
  const [form, setForm]           = useState(emptyForm);
  const [imageFiles, setFiles]    = useState([]);
  const [previews, setPreviews]   = useState([]);
  const [existingImages, setExist]= useState([]);
  const [removedImages, setRemoved]= useState([]);
  const [error, setError]         = useState(null);
  const [submitting, setSubmit]   = useState(false);

  // progress modal state
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressStage, setStage]       = useState("uploading"); // uploading | urls | saving | done
  const [uploadPct, setUploadPct]       = useState(0);
  const [progressError, setProgressErr] = useState(null);

  useEffect(() => {
    if (!open) return;
    if (editingBike) {
      setForm({
        brand:        editingBike.brand        || "",
        model:        editingBike.model        || "",
        modelYear:    editingBike.modelYear    || "",
        kmDriven:     editingBike.kmDriven     || "",
        ownership:    editingBike.ownership    || "1st",
        fuelType:     editingBike.fuelType     || "Petrol",
        ageValue:     editingBike.daysOld      || "",
        ageUnit:      "days",
        price:        editingBike.price        || "",
        downPayment:  editingBike.downPayment  || "",
        emiAvailable: !!editingBike.emiAmount,
        emiAmount:    editingBike.emiAmount    || "",
        status:       editingBike.status       || "Available",
        stock:        editingBike.stock        || 1,
      });
      setExist(editingBike.imageUrl || []);
    } else {
      setForm(emptyForm);
      setExist([]);
    }
    setFiles([]); setPreviews([]); setRemoved([]); setError(null);
  }, [open, editingBike]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type==="checkbox" ? checked : value }));
  };

  const handleFilesChange = (e) => {
    const MAX_FILE = 2.5*1024*1024, MAX_TOTAL = 8*1024*1024;
    const files = Array.from(e.target.files).slice(0, 5 - existingImages.length);
    const tooLarge = files.filter(f => f.size > MAX_FILE);
    if (tooLarge.length) return setError("Each image must be under 2.5 MB");
    if (files.reduce((s,f)=>s+f.size,0) > MAX_TOTAL) return setError("Total image size too large");
    setFiles(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
    setError(null);
  };

  const removeExisting = (idx) => {
    const removed = existingImages[idx];
    setRemoved(p => [...p, removed]);
    setExist(p => p.filter((_,i) => i !== idx));
  };

  const removeNew = (idx) => {
    setFiles(p => p.filter((_,i) => i !== idx));
    setPreviews(p => p.filter((_,i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmit(true);
    setProgressErr(null);
    setUploadPct(0);
    setStage("uploading");
    setProgressOpen(true);

    let daysOld = Number(form.ageValue) || 0;
    if (form.ageUnit === "months") daysOld = Math.round(daysOld * 30.44);
    else if (form.ageUnit === "years") daysOld = Math.round(daysOld * 365.25);

    const fd = new FormData();
    fd.append("brand", form.brand);
    fd.append("model", form.model);
    fd.append("modelYear", form.modelYear);
    fd.append("kmDriven", form.kmDriven);
    fd.append("ownership", form.ownership);
    fd.append("fuelType", form.fuelType);
    fd.append("daysOld", daysOld);
    fd.append("price", form.price);
    fd.append("downPayment", form.downPayment);
    fd.append("emiAvailable", form.emiAvailable);
    fd.append("emiAmount", form.emiAvailable ? form.emiAmount : 0);
    fd.append("status", form.status);
    fd.append("stock", form.stock || 1);

    existingImages.forEach(url => fd.append("imageUrls", url));
    imageFiles.forEach(file => fd.append("images", file));
    removedImages.forEach(url => fd.append("removedImages", url));

    const url    = editingBike ? `${API}/api/bike/${editingBike._id}` : `${API}/api/bike`;
    const method = editingBike ? "PUT" : "POST";

    console.log(`[BikeFormModal] ${method} ${url}`);
    console.log(`[BikeFormModal] files=${imageFiles.length}, existing=${existingImages.length}, removed=${removedImages.length}`);

    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.timeout = 120000; // 2 min — covers slow mobile uploads
    const headers = authHeaders();
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));

    // Stage 1 — real upload progress
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = (e.loaded / e.total) * 100;
        setUploadPct(pct);
        if (pct >= 99.5) {
          console.log("[BikeFormModal] upload done, server processing...");
        }
      }
    };

    // When browser finishes sending, server takes over: cloudinary + mongo save
    xhr.upload.onload = () => {
      console.log("[BikeFormModal] xhr.upload.onload — body fully sent");
      setUploadPct(100);
      // walk through "urls" → "saving" while waiting for server response
      setStage("urls");
      setTimeout(() => setStage((s) => (s === "urls" ? "saving" : s)), 900);
    };

    xhr.onload = () => {
      console.log(`[BikeFormModal] server responded ${xhr.status}`);
      let payload = {};
      try { payload = JSON.parse(xhr.responseText); } catch (e) {}
      if (xhr.status >= 200 && xhr.status < 300 && payload.success !== false) {
        setStage("done");
        console.log("[BikeFormModal] ✅ saved bike id:", payload?.bike?._id);
        // brief tick display, then close
        setTimeout(() => {
          setProgressOpen(false);
          setSubmit(false);
          onSaved?.();
          onClose();
        }, 1100);
      } else {
        const msg = payload?.error || `Save failed (HTTP ${xhr.status})`;
        console.error("[BikeFormModal] save failed:", msg, payload);
        setProgressErr(msg);
        setError(msg);
        setSubmit(false);
        setTimeout(() => setProgressOpen(false), 2500);
      }
    };

    xhr.onerror = () => {
      const online = navigator.onLine;
      const msg = online
        ? `Could not reach server. Check that ${API} is up, CORS headers are correct, and your network allows it.`
        : "You appear to be offline. Reconnect and try again.";
      console.error("[BikeFormModal] xhr.onerror — navigator.onLine:", online);
      setProgressErr(msg);
      setError(msg);
      setSubmit(false);
      setTimeout(() => setProgressOpen(false), 4000);
    };

    xhr.ontimeout = () => {
      const msg = "Upload took too long (>2 min). Try smaller images or check your connection.";
      console.error("[BikeFormModal] xhr.ontimeout");
      setProgressErr(msg);
      setError(msg);
      setSubmit(false);
      setTimeout(() => setProgressOpen(false), 4000);
    };

    xhr.onabort = () => {
      console.warn("[BikeFormModal] xhr.onabort");
      setSubmit(false);
      setProgressOpen(false);
    };

    xhr.send(fd);
  };

  if (!open) return null;

  return (
    <>
    <UploadProgressModal
      open={progressOpen}
      stage={progressStage}
      progress={uploadPct}
      error={progressError}
    />
    <div className="modal-backdrop" onClick={submitting ? undefined : onClose}>
      <div className="modal-shell" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingBike ? "Edit Bike" : "Add New Bike"}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <Close style={{fontSize:20}}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="form-error">
              <ErrorIcon style={{fontSize:18}}/>
              <span>{error}</span>
            </div>
          )}

          <div className="form-section-title">Bike Details</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Brand <span style={{color:"var(--danger)"}}>*</span></label>
              <select className="form-control" name="brand" required value={form.brand} onChange={handleChange}>
                <option value="">Select brand</option>
                {BRANDS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Model <span style={{color:"var(--danger)"}}>*</span></label>
              <input className="form-control" name="model" required value={form.model} onChange={handleChange} placeholder="e.g. Classic 350"/>
            </div>
            <div className="form-group">
              <label>Model Year <span style={{color:"var(--danger)"}}>*</span></label>
              <input className="form-control" type="number" name="modelYear" min="2000" max="2026" required value={form.modelYear} onChange={handleChange}/>
            </div>
            <div className="form-group">
              <label>KM Driven <span style={{color:"var(--danger)"}}>*</span></label>
              <input className="form-control" type="number" name="kmDriven" min="0" required value={form.kmDriven} onChange={handleChange}/>
            </div>
            <div className="form-group">
              <label>Ownership</label>
              <select className="form-control" name="ownership" value={form.ownership} onChange={handleChange}>
                {OWNERSHIP.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Fuel Type</label>
              <select className="form-control" name="fuelType" value={form.fuelType} onChange={handleChange}>
                {FUEL_TYPES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Age</label>
              <div style={{display:"flex",gap:6}}>
                <input className="form-control" type="number" name="ageValue" min="0" value={form.ageValue} onChange={handleChange} placeholder="0" style={{flex:1}}/>
                <div className="toggle-group">
                  {["days","months","years"].map(u => (
                    <button key={u} type="button"
                      className={`toggle-btn ${form.ageUnit===u?"active":""}`}
                      onClick={() => setForm(p=>({...p,ageUnit:u}))}>{u}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" name="status" value={form.status} onChange={handleChange}>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-section-title">Pricing</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Price (₹) <span style={{color:"var(--danger)"}}>*</span></label>
              <input className="form-control" type="number" name="price" min="0" required value={form.price} onChange={handleChange}/>
            </div>
            <div className="form-group">
              <label>Down Payment (₹)</label>
              <input className="form-control" type="number" name="downPayment" min="0" value={form.downPayment} onChange={handleChange}/>
            </div>
            <div className="form-group form-col-full">
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                <input type="checkbox" name="emiAvailable" checked={form.emiAvailable} onChange={handleChange}/>
                EMI Available
              </label>
            </div>
            {form.emiAvailable && (
              <div className="form-group">
                <label>Monthly EMI (₹)</label>
                <input className="form-control" type="number" name="emiAmount" min="0" value={form.emiAmount} onChange={handleChange}/>
              </div>
            )}
          </div>

          <div className="form-section-title">Images (max 5)</div>

          {(existingImages.length > 0 || previews.length > 0) && (
            <div className="image-previews">
              {existingImages.map((url, i) => (
                <div key={`ex-${i}`} className="preview-item">
                  <img src={url} alt={`existing-${i}`}/>
                  <button type="button" className="preview-remove" onClick={() => removeExisting(i)}>×</button>
                </div>
              ))}
              {previews.map((src, i) => (
                <div key={`new-${i}`} className="preview-item">
                  <img src={src} alt={`new-${i}`}/>
                  <button type="button" className="preview-remove" onClick={() => removeNew(i)}>×</button>
                </div>
              ))}
            </div>
          )}

          {existingImages.length + previews.length < 5 && (
            <label className="image-upload-box">
              <input type="file" accept="image/*" multiple onChange={handleFilesChange}/>
              <CloudUpload style={{fontSize:32, color:"var(--text-muted)"}}/>
              <p>Click to upload images · max 2.5 MB each, 5 total</p>
            </label>
          )}

          <div className="form-actions">
            <button type="button" className="btn secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? "Saving…" : (editingBike ? "Update Bike" : "Add Bike")}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
