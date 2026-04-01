function FilterBar({
  search,
  onSearch,
  category,
  onCategory,
  condition,
  onCondition,
  sortBy,
  onSortBy,
  categories,
}) {
  return (
    <section className="panel filter-grid">
      <input
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        placeholder="Search products by name..."
      />
      <select value={category} onChange={(event) => onCategory(event.target.value)}>
        <option value="all">All categories</option>
        {categories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <select value={condition} onChange={(event) => onCondition(event.target.value)}>
        <option value="all">All conditions</option>
        <option value="Excellent">Excellent</option>
        <option value="Very good">Very good</option>
        <option value="Good">Good</option>
        <option value="Restored">Restored</option>
        <option value="Running restored">Running restored</option>
        <option value="Needs service">Needs service</option>
        <option value="Needs tuning">Needs tuning</option>
      </select>
      <select value={sortBy} onChange={(event) => onSortBy(event.target.value)}>
        <option value="default">Sort by</option>
        <option value="priceAsc">Price: Low to high</option>
        <option value="priceDesc">Price: High to low</option>
        <option value="titleAsc">Title: A to Z</option>
      </select>
    </section>
  );
}

export default FilterBar;
