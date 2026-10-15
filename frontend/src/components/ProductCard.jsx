import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
    const navigate = useNavigate();

    const { addToCart } = useCart();

    const [wishlistStatus, setWishlistStatus] = useState("idle");
    const [wishlistError, setWishlistError] = useState("");

    const [cartStatus, setCartStatus] = useState("idle");
    const [cartError, setCartError] = useState("");

    const addToWishlist = async () => {
        setWishlistStatus("loading");
        setWishlistError("");

        try {
            const response = await fetch(
                `http://localhost:3000/wishlist/${product._id}`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to save product");
            }

            setWishlistStatus("success");
        } catch (error) {
            console.error("Wishlist error:", error);
            setWishlistError(error.message);
            setWishlistStatus("error");
        }
    };

    const handleAddToCart = async () => {
        setCartStatus("loading");
        setCartError("");

        try {
            await addToCart(product._id);

            setCartStatus("success");
        } catch (error) {
            console.error("Cart error:", error);

            setCartError(
                error.response?.data?.message ||
                "Unable to add product to cart"
            );

            setCartStatus("error");
        }
    };

    return (
        <div className="product-card">
            <img
                src={
                    product.name === "Mechanical Keyboard"
                        ? "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80"
                        : product.image
                }
                alt={product.name}
                className="product-image"
            />

            <div className="product-info">
                <h3>{product.name}</h3>

                <p className="product-category">
                    {product.category}
                </p>

                <p className="product-price">
                    ₹{product.price}
                </p>

                <p className="product-stock">
                    {product.stock > 0
                        ? `${product.stock} units left`
                        : "Out of stock"}
                </p>

                <button
                    onClick={() => navigate(`/products/${product._id}`)}
                >
                    View Details
                </button>

                {/* ADD TO CART */}
                <button
                    onClick={handleAddToCart}
                    disabled={
                        cartStatus === "loading" ||
                        product.stock <= 0
                    }
                >
                    {cartStatus === "idle" && "🛒 Add to Cart"}

                    {cartStatus === "loading" && "⏳ Adding..."}

                    {cartStatus === "success" && "✓ Added to Cart"}

                    {cartStatus === "error" && "🛒 Try Again"}
                </button>

                {cartError && (
                    <p className="cart-error">
                        {cartError}
                    </p>
                )}

                {/* WISHLIST */}
                <button
                    onClick={addToWishlist}
                    disabled={
                        wishlistStatus === "loading" ||
                        wishlistStatus === "success"
                    }
                >
                    {wishlistStatus === "idle" && "♡ Add to Wishlist"}

                    {wishlistStatus === "loading" && "⏳ Saving..."}

                    {wishlistStatus === "success" && "♥ Added to Wishlist"}

                    {wishlistStatus === "error" && "♡ Try Again"}
                </button>

                {wishlistError && (
                    <p className="wishlist-error">
                        {wishlistError}
                    </p>
                )}
            </div>
        </div>
    );
}

export default ProductCard;