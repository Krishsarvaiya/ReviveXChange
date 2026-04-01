import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

function ExchangePage() {
  const exchangeItems = products.filter((item) => item.purpose === "exchange");

  return (
    <section className="page-wrap">
      <div className="hero-exchange">
        <h2>Exchange Lounge</h2>
        <p>Swap vintage assets with verified collectors and transparent value expectations.</p>
      </div>

      <form className="panel form-vintage">
        <h3>Post Exchange Requirement</h3>
        <input placeholder="Your product to exchange" />
        <input placeholder="Product you want in return" />
        <textarea rows={4} placeholder="Add condition notes and preferred city..." />
        <button type="button" className="btn-primary">
          Publish Exchange
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
