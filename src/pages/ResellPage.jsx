import { useMemo, useState } from "react";
import FilterBar from "../components/FilterBar";
import PhotoUploader from "../components/PhotoUploader";
import ProductCard from "../components/ProductCard";
import { categories, products } from "../data/products";

function ResellPage() {
  const [amount, setAmount] = useState(9500);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [condition, setCondition] = useState("all");
  const [sortBy, setSortBy] = useState("default");

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

  return (
    <section className="page-wrap">
      <div className="hero-resell">
        <h2>Vintage Resale Marketplace</h2>
        <p>Buy and sell collectible products with transparent details and safe payment flow.</p>
      </div>

      <form className="panel form-vintage">
        <h3>Create Resale Listing</h3>
        <input placeholder="Product title" />
        <input placeholder="Expected price in INR" />
        <textarea rows={4} placeholder="Add complete description, history, and condition report..." />
        <PhotoUploader />
        <button type="button" className="btn-primary">
          Publish Listing
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
        <button type="button" className="btn-primary">
          Proceed to Pay
        </button>
      </section>
    </section>
  );
}

export default ResellPage;
