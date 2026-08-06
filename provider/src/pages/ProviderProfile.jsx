import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, ShieldCheck, MapPin, Award } from "lucide-react";
import { api } from "../api/client.js";

function ProviderProfile() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [providerData, reviewsData] = await Promise.all([
          api.getProviderById(id),
          api.getReviews(`?providerId=${id}`)
        ]);
        setProvider(providerData);
        setReviews(reviewsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return <div className="page-shell container"><p>Loading provider...</p></div>;
  }

  if (!provider) {
    return (
      <div className="page-shell container">
        <h1>Provider Not Found</h1>
        <p>This provider profile does not exist.</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    );
  }

  return (
    <main className="page-shell container" style={{ padding: "40px 20px" }}>
      <div style={{ display: "flex", gap: "30px", flexWrap: "wrap", alignItems: "flex-start" }}>
        
        {/* Provider Meta Box */}
        <div style={{ flex: "1 1 300px", background: "var(--surface)", padding: "30px", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--primary-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", fontWeight: "bold", color: "var(--primary)" }}>
              {provider.companyName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "24px" }}>{provider.companyName}</h1>
              {provider.isVerified && (
                <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--accent)", fontSize: "14px", fontWeight: "600", marginTop: "5px" }}>
                  <ShieldCheck size={16} /> Verified Professional
                </span>
              )}
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", color: "var(--muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><Award size={18} /> {provider.yearsExperience} Years Experience</span>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><Star size={18} fill="currentColor" color="#fbbf24" /> {provider.ratingAvg} ({provider.ratingCount} reviews)</span>
          </div>
        </div>

        {/* Provider Details & Reviews */}
        <div style={{ flex: "2 1 500px", display: "flex", flexDirection: "column", gap: "30px" }}>
          <section>
            <h2>About {provider.companyName}</h2>
            <p style={{ lineHeight: "1.6", color: "var(--text)" }}>{provider.bio || "This professional has not added a bio yet."}</p>
          </section>

          <section>
            <h2>Portfolio & Past Work</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ background: "var(--surface)", padding: "15px", borderRadius: "8px", border: "1px solid var(--border)", textAlign: "center" }}>
                <img src="/images/site/deep-clean.jpg" alt="After cleaning" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "6px", marginBottom: "10px" }} />
                <span style={{ fontWeight: "600" }}>Sparkling Clean Finish</span>
              </div>
              <div style={{ background: "var(--surface)", padding: "15px", borderRadius: "8px", border: "1px solid var(--border)", textAlign: "center" }}>
                <img src="/images/site/ac-maintenance.jpg" alt="AC Service" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "6px", marginBottom: "10px" }} />
                <span style={{ fontWeight: "600" }}>Expert Maintenance</span>
              </div>
            </div>
          </section>

          <section>
            <h2>Customer Reviews</h2>
            {reviews.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>No reviews yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {reviews.map(review => (
                  <div key={review._id || review.id} style={{ background: "var(--surface)", padding: "20px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <div className="stars" style={{ color: "#fbbf24", display: "flex" }}>
                        {Array.from({ length: review.rating }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                      </div>
                      <small style={{ color: "var(--muted)" }}>{new Date(review.createdAt).toLocaleDateString()}</small>
                    </div>
                    <p style={{ margin: 0 }}>"{review.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default ProviderProfile;
