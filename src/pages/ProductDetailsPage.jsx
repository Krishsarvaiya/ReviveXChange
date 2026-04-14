import { Link, useParams } from "react-router-dom";
import { products } from "../data/products";

function ProductDetailsPage() {
  const { productId } = useParams();
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return (
      <section className="panel">
        <h2>Product not found</h2>
        <Link to="/app/marketplace" className="btn-link">
          Back to marketplace
        </Link>
      </section>
    );
  }

  return (
    <section className="details-layout">
      <img src={product.image} alt={product.title} className="details-image" />
      <article className="panel">
        <p className="chip">{product.category}</p>
        <h2>{product.title}</h2>
        <p>{product.description}</p>
        <p className="price">INR {product.price.toLocaleString("en-IN")}</p>
        <div className="spec-grid">
          <p>
            <strong>Era:</strong> {product.era}
          </p>
          <p>
            <strong>Origin:</strong> {product.origin}
          </p>
          <p>
            <strong>Material:</strong> {product.material}
          </p>
          <p>
            <strong>Dimensions:</strong> {product.dimensions}
          </p>
          <p>
            <strong>Condition:</strong> {product.condition}
          </p>
        </div>
        <h3>Highlights</h3>
        <ul>
          {product.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link to={`/app/checkout/${product.id}`} className="btn-primary inline-block">
          Buy Now
        </Link>
      </article>
    </section>
  );
}

export default ProductDetailsPage;
