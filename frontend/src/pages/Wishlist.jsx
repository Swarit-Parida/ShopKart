import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Wishlist() {
    const navigate = useNavigate();

    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:3000/wishlist",
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load wishlist"
                );
            }

            setWishlist(data.wishlist);
        } catch (error) {
            console.error("Wishlist error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const removeFromWishlist = async (productId) => {
        try {
            const response = await fetch(
                `http://localhost:3000/wishlist/${productId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to remove product"
                );
            }

            setWishlist((currentWishlist) =>
                currentWishlist.filter(
                    (product) => product._id !== productId
                )
            );
        } catch (error) {
            console.error("Remove wishlist error:", error);
            alert(error.message);
        }
    };

    if (loading) {
        return (
            <div className="wishlist-page">
                <h1>My Wishlist</h1>
                <p>Loading your wishlist...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="wishlist-page">
                <h1>My Wishlist</h1>

                <p>Something went wrong.</p>
                <p>{error}</p>

                <button onClick={fetchWishlist}>
                    Try Again
                </button>
            </div>
        );
    }

    if (wishlist.length === 0) {
        return (
            <div className="wishlist-page">
                <h1>My Wishlist</h1>

                <div className="empty-wishlist">
                    <div className="empty-heart">❤️</div>

                    <h2>Your wishlist is empty</h2>

                    <p>
                        Save products you love and find them
                        here later.
                    </p>

                    <button
                        onClick={() => navigate("/products")}
                    >
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            <h1>My Wishlist</h1>

            <p>
                {wishlist.length}{" "}
                {wishlist.length === 1
                    ? "product"
                    : "products"}{" "}
                saved
            </p>

            <div className="wishlist-grid">
                {wishlist.map((product) => (
                    <div
                        className="wishlist-card"
                        key={product._id}
                    >
                        <img
                            src={
                                product.name ===
                                "Mechanical Keyboard"
                                    ? "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80"
                                    : product.image
                            }
                            alt={product.name}
                        />

                        <div className="wishlist-card-info">
                            <h3>{product.name}</h3>

                            <p>
                                {product.category}
                            </p>

                            <h4>
                                ₹{product.price}
                            </h4>

                            <p>
                                {product.stock > 0
                                    ? `${product.stock} units left`
                                    : "Out of stock"}
                            </p>

                            <button
                                onClick={() =>
                                    navigate(
                                        `/products/${product._id}`
                                    )
                                }
                            >
                                View Details
                            </button>

                            <button
                                onClick={() =>
                                    removeFromWishlist(
                                        product._id
                                    )
                                }
                            >
                                Remove from Wishlist
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Wishlist;