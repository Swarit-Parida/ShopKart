import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";

function Checkout() {
    const navigate = useNavigate();

    const {
        cartItems,
        cartLoading,
        subtotal,
        clearCart,
    } = useCart();

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        addressLine1: "",
        city: "",
        state: "",
        pincode: "",
    });

    const [errors, setErrors] = useState({});
    const [checkoutError, setCheckoutError] = useState("");
    const [placingOrder, setPlacingOrder] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        // Remove error when user starts correcting field
        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }

        if (!/^\d{10}$/.test(formData.phone.trim())) {
            newErrors.phone = "Phone number must contain 10 digits";
        }

        if (!formData.addressLine1.trim()) {
            newErrors.addressLine1 = "Address is required";
        }

        if (!formData.city.trim()) {
            newErrors.city = "City is required";
        }

        if (!formData.state.trim()) {
            newErrors.state = "State is required";
        }

        if (!/^\d{6}$/.test(formData.pincode.trim())) {
            newErrors.pincode = "Pincode must contain 6 digits";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            // Don't load it again if already loaded
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement("script");

            script.src =
                "https://checkout.razorpay.com/v1/checkout.js";

            script.onload = () => resolve(true);

            script.onerror = () => resolve(false);

            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async () => {
        setCheckoutError("");

        // -----------------------------------
        // 1. Client-side validation
        // -----------------------------------

        if (!validateForm()) {
            return;
        }

        // -----------------------------------
        // 2. Don't allow checkout with
        //    empty cart
        // -----------------------------------

        if (cartItems.length === 0) {
            setCheckoutError("Your cart is empty");
            return;
        }

        try {
            setPlacingOrder(true);

            // -----------------------------------
            // 3. Load Razorpay Checkout script
            // -----------------------------------

            const scriptLoaded = await loadRazorpayScript();

            if (!scriptLoaded) {
                setCheckoutError(
                    "Unable to load Razorpay. Please try again."
                );
                return;
            }

            // -----------------------------------
            // 4. Ask backend to create
            //    ShopKart + Razorpay order
            // -----------------------------------

            const response = await api.post(
                "/orders/create-payment-order",
                {
                    shippingAddress: {
                        fullName: formData.fullName.trim(),
                        phone: formData.phone.trim(),
                        addressLine1: formData.addressLine1.trim(),
                        city: formData.city.trim(),
                        state: formData.state.trim(),
                        pincode: formData.pincode.trim(),
                    },
                }
            );

            const data = response.data;

            // -----------------------------------
            // 5. Open Razorpay Checkout
            // -----------------------------------

            const options = {
                key: data.key,

                amount: data.amount,

                currency: data.currency,

                name: "ShopKart",

                description: "ShopKart Order",

                order_id: data.razorpayOrderId,

                prefill: {
                    name: formData.fullName.trim(),
                    contact: formData.phone.trim(),
                },

                handler: async function (paymentResponse) {
                    try {
                        // -----------------------------------
                        // 6. Send payment details to backend
                        // -----------------------------------

                        const verifyResponse = await api.post(
                            "/orders/verify-payment",
                            {
                                shopKartOrderId:
                                    data.shopKartOrderId,

                                razorpay_order_id:
                                    paymentResponse.razorpay_order_id,

                                razorpay_payment_id:
                                    paymentResponse.razorpay_payment_id,

                                razorpay_signature:
                                    paymentResponse.razorpay_signature,
                            }
                        );

                        if (verifyResponse.data.success) {
                            // -----------------------------------
                            // 7. Clear frontend cart state
                            // -----------------------------------

                            clearCart();

                            // -----------------------------------
                            // 8. Go to success page
                            // -----------------------------------

                            navigate(
                                `/order-success/${data.shopKartOrderId}`
                            );
                        }
                    } catch (error) {
                        console.error(
                            "Payment verification error:",
                            error
                        );

                        setCheckoutError(
                            error.response?.data?.message ||
                            "Payment verification failed"
                        );
                    } finally {
                        setPlacingOrder(false);
                    }
                },
            };

            // -----------------------------------
            // 9. Handle payment failure
            // -----------------------------------

            const paymentObject =
                new window.Razorpay(options);

            paymentObject.on(
                "payment.failed",
                function (response) {
                    console.error(
                        "Payment failed:",
                        response.error
                    );

                    setCheckoutError(
                        "Payment failed. Your cart has not been cleared. Please try again."
                    );

                    setPlacingOrder(false);
                }
            );

            paymentObject.open();
        } catch (error) {
            console.error(
                "Create payment order error:",
                error
            );

            setCheckoutError(
                error.response?.data?.message ||
                "Unable to create payment order"
            );

            setPlacingOrder(false);
        }
    };

    // -----------------------------------
    // Loading
    // -----------------------------------

    if (cartLoading) {
        return (
            <div className="checkout-page">
                <h1>Checkout</h1>
                <p>Loading your cart...</p>
            </div>
        );
    }

    // -----------------------------------
    // Empty cart
    // -----------------------------------

    if (cartItems.length === 0) {
        return (
            <div className="checkout-page">
                <h1>Checkout</h1>

                <div className="cart-empty">
                    <h2>Your cart is empty 🛒</h2>

                    <p>
                        Add some products before checking out.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/products")
                        }
                    >
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>

            {checkoutError && (
                <div className="checkout-error">
                    {checkoutError}
                </div>
            )}

            <div className="checkout-content">

                {/* SHIPPING FORM */}

                <div className="checkout-form">
                    <h2>Shipping Details</h2>

                    <div className="form-group">
                        <label>Full Name</label>

                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                        />

                        {errors.fullName && (
                            <p className="field-error">
                                {errors.fullName}
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Phone</label>

                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="10-digit phone number"
                        />

                        {errors.phone && (
                            <p className="field-error">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Address</label>

                        <input
                            type="text"
                            name="addressLine1"
                            value={formData.addressLine1}
                            onChange={handleChange}
                            placeholder="Address"
                        />

                        {errors.addressLine1 && (
                            <p className="field-error">
                                {errors.addressLine1}
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>City</label>

                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City"
                        />

                        {errors.city && (
                            <p className="field-error">
                                {errors.city}
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>State</label>

                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="State"
                        />

                        {errors.state && (
                            <p className="field-error">
                                {errors.state}
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Pincode</label>

                        <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            placeholder="6-digit pincode"
                        />

                        {errors.pincode && (
                            <p className="field-error">
                                {errors.pincode}
                            </p>
                        )}
                    </div>
                </div>

                {/* ORDER SUMMARY */}

                <div className="checkout-summary">
                    <h2>Order Summary</h2>

                    {cartItems.map((item) => (
                        <div
                            className="checkout-item"
                            key={item.product._id}
                        >
                            <div>
                                <strong>
                                    {item.product.name}
                                </strong>

                                <p>
                                    × {item.quantity}
                                </p>
                            </div>

                            <span>
                                ₹
                                {(
                                    item.product.price *
                                    item.quantity
                                ).toLocaleString("en-IN")}
                            </span>
                        </div>
                    ))}

                    <hr />

                    <h2>
                        Total: ₹
                        {subtotal.toLocaleString("en-IN")}
                    </h2>

                    <button
                        onClick={handlePlaceOrder}
                        disabled={placingOrder}
                    >
                        {placingOrder
                            ? "Processing..."
                            : "Place Order"}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default Checkout;