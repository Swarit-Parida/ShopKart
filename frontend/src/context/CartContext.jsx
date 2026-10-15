import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartLoading, setCartLoading] = useState(true);
    const [cartError, setCartError] = useState("");

    // Get cart from backend
    const fetchCart = async () => {
        try {
            setCartLoading(true);
            setCartError("");

            const response = await api.get("/cart");

            setCartItems(response.data.cart || []);
        } catch (error) {
            console.error("Fetch cart error:", error);

            setCartError(
                error.response?.data?.message || "Unable to load cart"
            );
        } finally {
            setCartLoading(false);
        }
    };

    // Add product to cart
    const addToCart = async (productId) => {
        try {
            setCartError("");

            const response = await api.post(`/cart/${productId}`);

            // Backend returns updated cart
            await fetchCart();

            return response.data;
        } catch (error) {
            console.error("Add to cart error:", error);

            setCartError(
                error.response?.data?.message || "Unable to add product to cart"
            );

            throw error;
        }
    };

    // Update quantity
    const updateQuantity = async (productId, quantity) => {
        try {
            setCartError("");

            await api.patch(`/cart/${productId}`, {
                quantity,
            });

            await fetchCart();
        } catch (error) {
            console.error("Update cart error:", error);

            setCartError(
                error.response?.data?.message || "Unable to update quantity"
            );

            throw error;
        }
    };

    // Remove product
    const removeFromCart = async (productId) => {
        try {
            setCartError("");

            await api.delete(`/cart/${productId}`);

            await fetchCart();
        } catch (error) {
            console.error("Remove from cart error:", error);

            setCartError(
                error.response?.data?.message || "Unable to remove product"
            );

            throw error;
        }
    };

    // Clear cart in frontend state
    const clearCart = () => {
        setCartItems([]);
    };
    // Fetch cart when app loads
    useEffect(() => {
        fetchCart();
    }, []);

    // Total quantity for Navbar
    const cartCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    // Subtotal for Cart page
    const subtotal = cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                cartLoading,
                cartError,
                cartCount,
                subtotal,
                addToCart,
                updateQuantity,
                removeFromCart,
                fetchCart,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};