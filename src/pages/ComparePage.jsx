import { useMemo, useState } from "react";
import { products } from "../data/products";

function ComparePage() {
  const [firstId, setFirstId] = useState(products[0]?.id ?? "");
  const [secondId, setSecondId] = useState(products[1]?.id ?? "");

  const firstProduct = useMemo(() => products.find((item) => item.id === firstId), [firstId]);
  const secondProduct = useMemo(() => products.find((item) => item.id === secondId), [secondId]);

  return (
    <section className="page-wrap">
      <div className="hero-vintage">
        <h2>Product Comparison</h2>
        <p>Compare vintage items side-by-side before buying or exchanging.</p>
      </div>

      <section className="panel compare-picks">
        <select value={firstId} onChange={(event) => setFirstId(event.target.value)}>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.title}
            </option>
          ))}
        </select>
        <select value={secondId} onChange={(event) => setSecondId(event.target.value)}>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.title}
            </option>
          ))}
        </select>
      </section>

      {firstProduct && secondProduct && (
        <section className="panel compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Specification</th>
                <th>{firstProduct.title}</th>
                <th>{secondProduct.title}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Image</td>
                <td>
                  <img src={firstProduct.image} alt={firstProduct.title} className="compare-image" />
                </td>
                <td>
                  <img src={secondProduct.image} alt={secondProduct.title} className="compare-image" />
                </td>
              </tr>
              <tr>
                <td>Category</td>
                <td>{firstProduct.category}</td>
                <td>{secondProduct.category}</td>
              </tr>
              <tr>
                <td>Price</td>
                <td>INR {firstProduct.price.toLocaleString("en-IN")}</td>
                <td>INR {secondProduct.price.toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td>Condition</td>
                <td>{firstProduct.condition}</td>
                <td>{secondProduct.condition}</td>
              </tr>
              <tr>
                <td>Era</td>
                <td>{firstProduct.era}</td>
                <td>{secondProduct.era}</td>
              </tr>
              <tr>
                <td>Origin</td>
                <td>{firstProduct.origin}</td>
                <td>{secondProduct.origin}</td>
              </tr>
              <tr>
                <td>Material</td>
                <td>{firstProduct.material}</td>
                <td>{secondProduct.material}</td>
              </tr>
              <tr>
                <td>Dimensions</td>
                <td>{firstProduct.dimensions}</td>
                <td>{secondProduct.dimensions}</td>
              </tr>
            </tbody>
          </table>
        </section>
      )}
    </section>
  );
}

export default ComparePage;
