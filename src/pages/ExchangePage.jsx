import { useState } from "react";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";
import { createExchangePost } from "../lib/api";

function ExchangePage() {
  const exchangeItems = products.filter((item) => item.purpose === "exchange");
  const [offerProduct, setOfferProduct] = useState("");
  const [wantProduct, setWantProduct] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const data = await createExchangePost({ offerProduct, wantProduct, notes });
      setSuccess(`Exchange post published (reference #${data.id}).`);
      setOfferProduct("");
      setWantProduct("");
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-wrap">
      <div className="hero-exchange">
        <h2>Exchange Lounge</h2>
        <p>Swap vintage assets with verified collectors and transparent value expectations.</p>
      </div>

      <form
        className="panel form-vintage"
        onSubmit={(e) => {
          e.preventDefault();
          handlePublish();
        }}
      >
        <h3>Post Exchange Requirement</h3>
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
          placeholder="Your product to exchange"
          value={offerProduct}
          onChange={(e) => setOfferProduct(e.target.value)}
          required
          minLength={2}
        />
        <input
          placeholder="Product you want in return"
          value={wantProduct}
          onChange={(e) => setWantProduct(e.target.value)}
          required
          minLength={2}
        />
        <textarea
          rows={4}
          placeholder="Add condition notes and preferred city..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Publishing…" : "Publish Exchange"}
        </button>
      </form>

      <section className="product-grid">
        {exchangeItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </section>
  );
}

export default ExchangePage;
