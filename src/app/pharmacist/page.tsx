export const dynamic = "force-dynamic";
export const metadata = { title: "Pharmacist workspace" };

export default function PharmacistPage() {
  return (
    <>
      <section className="dashboard-heading compact-heading">
        <div>
          <span className="eyebrow">Pharmacy workspace</span>
          <h1>Pharmacist dashboard</h1>
          <p>Your Suga.Health pharmacist account is active. Pharmacy workflow tools can be added here in the next product pass.</p>
        </div>
      </section>
      <section className="dashboard-section">
        <div className="empty-state">
          <div>
            <h3>Account ready</h3>
            <p>This workspace is isolated from patient and doctor access.</p>
          </div>
        </div>
      </section>
    </>
  );
}
