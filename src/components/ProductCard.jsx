import { Link } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <img src={product.image} alt={product.title} className="product-image" />
      <div className="product-content">
        <p className="chip">{product.category}</p>
        <h3>{product.title}</h3>
        <p>{product.description}</p>
        <div className="meta">
          <span>Era: {product.era}</span>
          <span>Condition: {product.condition}</span>
        </div>
        <p className="price">INR {product.price.toLocaleString("en-IN")}</p>
        <Link to={`/app/product/${product.id}`} className="btn-link">
          View Details
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
