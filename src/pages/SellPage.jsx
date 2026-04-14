import { useState } from "react";
import { createSellListing } from "../lib/api";

function SellPage() {
  const [title, setTitle] = useState("");
  const [askingPriceInr, setAskingPriceInr] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
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
      const price = Number(String(askingPriceInr).replace(/,/g, ""));
      const data = await createSellListing({
        title,
        askingPriceInr: price,
        category,
        condition,
        description,
      });
      setSuccess(`Sell listing created successfully (listing #${data.id}).`);
      setTitle("");
      setAskingPriceInr("");
      setCategory("");
      setCondition("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create listing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-wrap">
      <div className="hero-resell">
        <h2>Direct Sell Desk</h2>
        <p>List your vintage item for direct sale with complete condition and pricing details.</p>
      </div>

      <form className="panel form-vintage" onSubmit={handleSubmit}>
        <h3>Create Sell Listing</h3>
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
          placeholder="Product title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={2}
        />
        <input
          type="number"
          min={1}
          step={1}
          placeholder="Asking price in INR"
          value={askingPriceInr}
          onChange={(e) => setAskingPriceInr(e.target.value)}
          required
        />
        <input
          placeholder="Category (e.g. watches, clocks, cars)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          minLength={2}
        />
        <input
          placeholder="Condition (e.g. restored, original, used)"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          required
          minLength={2}
        />
        <textarea
          rows={5}
          placeholder="Describe condition, ownership history, and included documents..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          minLength={10}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Publish Sell Listing"}
        </button>
      </form>
    </section>
  );
}

export default SellPage;
