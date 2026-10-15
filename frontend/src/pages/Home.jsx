import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Home() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await api.get("/customers/me");

        setCustomer(response.data);
      } catch (error) {
        setError("You are not logged in.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate]);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <main className="home-container">
      <h1>Welcome to ShopKart</h1>

      {customer && (
        <div className="profile-card">
          <h2>Welcome, {customer.fullName}!</h2>

          <p>
            <strong>Email:</strong> {customer.email}
          </p>

          <p>
            <strong>Phone:</strong> {customer.phone}
          </p>
        </div>
      )}
    </main>
  );
}

export default Home;