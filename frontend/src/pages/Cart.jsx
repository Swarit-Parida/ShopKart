import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
    const navigate = useNavigate();

    const {
        cartItems,
        cartLoading,
        cartError,
        cartCount,
        subtotal,
        updateQuantity,
        removeFromCart,
        fetchCart,
    } = useCart();

    if (cartLoading) {
        return (
            <div className="cart-page">
                <h1>My Cart</h1>
                <p>Loading your cart...</p>
            </div>
        );
    }

    if (cartError && cartItems.length === 0) {
        return (
            <div className="cart-page">
                <h1>My Cart</h1>

                <p>{cartError}</p>

                <button onClick={fetchCart}>
                    Try Again
                </button>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="cart-page">
                <h1>My Cart</h1>

                <div className="cart-empty">
                    <h2>Your cart is empty 🛒</h2>

                    <p>
                        Looks like you haven't added anything yet.
                    </p>

                    <button onClick={() => navigate("/products")}>
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <h1>My Cart</h1>

            <div className="cart-content">

                {/* CART ITEMS */}
                <div className="cart-items">
                    {cartItems.map((item) => (
                        <div
                            className="cart-item"
                            key={item.product._id}
                        >
                            <img
                                src={
                                    item.product.name === "Mechanical Keyboard"
                                        ? "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80"
                                        : item.product.image
                                }
                                alt={item.product.name}
                                className="cart-item-image"
                            />

                            <div className="cart-item-info">
                                <h2>{item.product.name}</h2>

                                <p>
                                    ₹{item.product.price}
                                </p>

                                <p>
                                    {item.product.stock} units available
                                </p>

                                <div className="quantity-controls">

                                    <button
                                        onClick={() => {
                                            if (item.quantity > 1) {
                                                updateQuantity(
                                                    item.product._id,
                                                    item.quantity - 1
                                                );
                                            }
                                        }}
                                        disabled={item.quantity === 1}
                                    >
                                        -
                                    </button>

                                    <span>
                                        {item.quantity}
                                    </span>

                                    <button
                                        onClick={() => {
                                            if (
                                                item.quantity < item.product.stock
                                            ) {
                                                updateQuantity(
                                                    item.product._id,
                                                    item.quantity + 1
                                                );
                                            }
                                        }}
                                        disabled={
                                            item.quantity >= item.product.stock
                                        }
                                    >
                                        +
                                    </button>

                                </div>

                                <button
                                    onClick={() =>
                                        removeFromCart(item.product._id)
                                    }
                                >
                                    Remove
                                </button>
                            </div>

                            <div className="cart-item-total">
                                ₹
                                {(
                                    item.product.price *
                                    item.quantity
                                ).toLocaleString("en-IN")}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ORDER SUMMARY */}
                <div className="order-summary">
                    <h2>Order Summary</h2>

                    <p>
                        Items: {cartCount}
                    </p>

                    <h3>
                        Subtotal: ₹{subtotal.toLocaleString("en-IN")}
                    </h3>

                    <button onClick={() => navigate("/checkout")}>
                        Proceed to Checkout
                    </button>
                </div>

            </div>
        </div>
    );
}

export default Cart;