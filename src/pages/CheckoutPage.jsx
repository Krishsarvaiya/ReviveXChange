import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { products } from "../data/products";
import { createOrder } from "../lib/api";

function CheckoutPage() {
  const { productId } = useParams();
  const product = useMemo(() => products.find((item) => item.id === productId), [productId]);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const data = await createOrder({
        productId: product.id,
        productTitle: product.title,
        amountInr: product.price,
        buyerName,
        buyerPhone,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        paymentMethod,
      });
      setSuccess(`Order #${data.id} confirmed. ${data.paymentMessage}`);
      setBuyerName("");
      setBuyerPhone("");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setState("");
      setPincode("");
      setPaymentMethod("upi");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-wrap">
      <div className="hero-vintage">
        <h2>Secure Checkout</h2>
        <p>Enter delivery details and select payment option to place your order.</p>
      </div>

      <section className="panel">
        <h3>{product.title}</h3>
        <p className="chip">{product.category}</p>
        <p className="price">Payable amount: INR {product.price.toLocaleString("en-IN")}</p>
      </section>

      <form className="panel form-vintage" onSubmit={handleSubmit}>
        <h3>Buyer Details</h3>
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
          placeholder="Full name"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          required
          minLength={2}
        />
        <input
          placeholder="Phone number (10 digits)"
          value={buyerPhone}
          onChange={(e) => setBuyerPhone(e.target.value)}
          required
          minLength={10}
          maxLength={10}
        />
        <textarea
          rows={3}
          placeholder="Address line 1 (House no, street, area)"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
          required
          minLength={5}
        />
        <input
          placeholder="Address line 2 (optional)"
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
        />
        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          minLength={2}
        />
        <input
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          required
          minLength={2}
        />
        <input
          placeholder="Pincode (6 digits)"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          required
          minLength={6}
          maxLength={6}
        />

        <h3>Payment Option</h3>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="cod">Cash on Delivery</option>
        </select>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Placing order..." : "Place Order"}
        </button>
      </form>
    </section>
  );
}

export default CheckoutPage;
