import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();

  const { cartCount } = useCart();

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");

      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar">
      <h2 onClick={() => navigate("/home")}>
        ShopKart
      </h2>

      <div className="navbar-links">
        <button onClick={() => navigate("/home")}>
          Home
        </button>

        <button onClick={() => navigate("/products")}>
          Products
        </button>

        <button onClick={() => navigate("/wishlist")}>
          Wishlist
        </button>

        <button onClick={() => navigate("/cart")}>
          Cart ({cartCount})
        </button>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;