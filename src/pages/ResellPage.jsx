import { useMemo, useState } from "react";
import FilterBar from "../components/FilterBar";
import PhotoUploader from "../components/PhotoUploader";
import ProductCard from "../components/ProductCard";
import { categories, products } from "../data/products";
import { createResellListing } from "../lib/api";

function ResellPage() {
  const [amount, setAmount] = useState(9500);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [condition, setCondition] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [title, setTitle] = useState("");
  const [priceInr, setPriceInr] = useState("");
  const [description, setDescription] = useState("");
  const [photoFiles, setPhotoFiles] = useState([]);
  const [listingError, setListingError] = useState("");
  const [listingSuccess, setListingSuccess] = useState("");
  const [listingLoading, setListingLoading] = useState(false);
  const [payMessage, setPayMessage] = useState("");
  const [uploaderKey, setUploaderKey] = useState(0);

  const paymentMessage = useMemo(() => {
    return `Razorpay checkout placeholder for INR ${amount.toLocaleString("en-IN")}.`;
  }, [amount]);

  const resellItems = useMemo(() => {
    const onlyResell = products.filter((item) => item.purpose === "resell");
    const filtered = onlyResell.filter((product) => {
      const matchSearch = product.title.toLowerCase().includes(search.trim().toLowerCase());
      const matchCategory = category === "all" || product.category === category;
      const matchCondition = condition === "all" || product.condition === condition;
      return matchSearch && matchCategory && matchCondition;
    });
    if (sortBy === "priceAsc") return [...filtered].sort((a, b) => a.price - b.price);
    if (sortBy === "priceDesc") return [...filtered].sort((a, b) => b.price - a.price);
    if (sortBy === "titleAsc") return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    return filtered;
  }, [search, category, condition, sortBy]);

  const handlePublishListing = async (e) => {
    e.preventDefault();
    setListingError("");
    setListingSuccess("");
    setListingLoading(true);
    try {
      const priceNum = Number(String(priceInr).replace(/,/g, ""));
      const photosMeta = photoFiles.map((f) => ({ name: f.name, size: f.size }));
      await createResellListing({
        title,
        priceInr: priceNum,
        description,
        photosMeta: photosMeta.length ? photosMeta : undefined,
      });
      setListingSuccess("Listing published successfully. It is saved to your account.");
      setTitle("");
      setPriceInr("");
      setDescription("");
      setPhotoFiles([]);
      setUploaderKey((k) => k + 1);
    } catch (err) {
      setListingError(err instanceof Error ? err.message : "Could not publish listing.");
    } finally {
      setListingLoading(false);
    }
  };

  const handleProceedPay = () => {
    setPayMessage(
      `Demo only: payment step for INR ${amount.toLocaleString("en-IN")} was recorded locally. Connect Razorpay keys to go live.`
    );
  };

  return (
    <section className="page-wrap">
      <div className="hero-resell">
        <h2>Vintage Resale Marketplace</h2>
        <p>Buy and sell collectible products with transparent details and safe payment flow.</p>
      </div>

      <form className="panel form-vintage" onSubmit={handlePublishListing}>
        <h3>Create Resale Listing</h3>
        {listingError ? (
          <p className="auth-error" role="alert">
            {listingError}
          </p>
        ) : null}
        {listingSuccess ? (
          <p className="form-success" role="status">
            {listingSuccess}
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
          placeholder="Expected price in INR"
          value={priceInr}
          onChange={(e) => setPriceInr(e.target.value)}
          required
        />
        <textarea
          rows={4}
          placeholder="Add complete description, history, and condition report (min 10 characters)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          minLength={10}
        />
        <PhotoUploader key={uploaderKey} onFilesChange={setPhotoFiles} />
        <button type="submit" className="btn-primary" disabled={listingLoading}>
          {listingLoading ? "Publishing…" : "Publish Listing"}
        </button>
      </form>

      <FilterBar
        search={search}
        onSearch={setSearch}
        category={category}
        onCategory={setCategory}
        condition={condition}
        onCondition={setCondition}
        sortBy={sortBy}
        onSortBy={setSortBy}
        categories={categories}
      />

      <section className="product-grid">
        {resellItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>

      <section className="panel">
        <h3>Razorpay Checkout Preview</h3>
        <input
          type="number"
          value={amount}
          min={1}
          onChange={(event) => setAmount(Number(event.target.value) || 1)}
        />
        <p>{paymentMessage}</p>
        {payMessage ? (
          <p className="form-success" role="status">
            {payMessage}
          </p>
        ) : null}
        <button type="button" className="btn-primary" onClick={handleProceedPay}>
          Proceed to Pay
        </button>
      </section>
    </section>
  );
}

export default ResellPage;
