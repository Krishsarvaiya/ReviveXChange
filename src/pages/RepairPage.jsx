import { useState } from "react";
import { createRepairRequest } from "../lib/api";

const REPAIR_CATEGORIES = [
  { value: "", label: "Select category", disabled: true },
  { value: "watches", label: "Watches" },
  { value: "clocks", label: "Clocks" },
  { value: "cars", label: "Cars" },
  { value: "rugs", label: "Rugs" },
  { value: "showpieces", label: "Showpieces" },
];

function RepairPage() {
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const data = await createRepairRequest({ title, brand, category, description });
      setSuccess(`Repair request sent (reference #${data.id}). We will follow up with an estimate.`);
      setTitle("");
      setBrand("");
      setCategory("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-wrap">
      <div className="hero-repair">
        <h2>Vintage Repair Desk</h2>
        <p>Book certified restoration experts for watches, clocks, rugs, cars, and decor pieces.</p>
      </div>

      <form className="panel form-vintage" onSubmit={handleSubmit}>
        <h3>Submit Repair Request</h3>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="form-success" role="status">
            {success}
          </p>
        ) : null}
        <input
          placeholder="Product title (e.g., 1950 Swiss Watch)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={2}
        />
        <input
          placeholder="Brand / Maker (optional)"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          {REPAIR_CATEGORIES.map((opt) => (
            <option key={opt.value || "placeholder"} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <textarea
          rows={5}
          placeholder="Mention issue, age, service history, and required urgency (min 10 characters)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          minLength={10}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Sending…" : "Send for Estimate"}
        </button>
      </form>
    </section>
  );
}

export default RepairPage;
