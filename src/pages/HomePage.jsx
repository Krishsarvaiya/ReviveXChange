import { useMemo, useState } from "react";
import FilterBar from "../components/FilterBar";
import ProductCard from "../components/ProductCard";
import { categories, products } from "../data/products";

function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [condition, setCondition] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
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
      <div className="hero-vintage">
        <h2>Marketplace Highlights</h2>
        <p>
          Discover authenticated vintage collectibles with detailed specifications, service history,
          and trusted exchange options.
        </p>
      </div>

      <section className="panel">
        <h3>Explore Categories</h3>
        <div className="pill-row">
          {categories.map((category) => (
            <span key={category} className="pill">
              {category}
            </span>
          ))}
        </div>
      </section>

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
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </section>
  );
}

export default HomePage;
