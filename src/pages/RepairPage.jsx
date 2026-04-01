function RepairPage() {
  return (
    <section className="page-wrap">
      <div className="hero-repair">
        <h2>Vintage Repair Desk</h2>
        <p>Book certified restoration experts for watches, clocks, rugs, cars, and decor pieces.</p>
      </div>

      <form className="panel form-vintage">
        <h3>Submit Repair Request</h3>
        <input placeholder="Product title (e.g., 1950 Swiss Watch)" />
        <input placeholder="Brand / Maker (optional)" />
        <select defaultValue="">
          <option value="" disabled>
            Select category
          </option>
          <option>Watches</option>
          <option>Clocks</option>
          <option>Cars</option>
          <option>Rugs</option>
          <option>Showpieces</option>
        </select>
        <textarea rows={5} placeholder="Mention issue, age, service history, and required urgency..." />
        <button type="button" className="btn-primary">
          Send for Estimate
        </button>
      </form>
    </section>
  );
}

export default RepairPage;
