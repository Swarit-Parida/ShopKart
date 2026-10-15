import { useNavigate, useParams } from "react-router-dom";

function OrderSuccess() {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <div className="order-success-page">

            <div className="order-success-card">

                <div className="success-icon">
                    ✅
                </div>

                <h1>Order Placed Successfully!</h1>

                <p>
                    Your payment was successful and your order
                    has been placed.
                </p>

                <div className="order-success-info">
                    <p>
                        <strong>Order ID:</strong>
                    </p>

                    <p>{id}</p>

                    <p>
                        Your order has been saved successfully.
                    </p>
                </div>

                <div className="order-success-buttons">

                    <button
                        onClick={() => navigate("/orders")}
                    >
                        View My Orders
                    </button>

                    <button
                        onClick={() => navigate("/products")}
                    >
                        Continue Shopping
                    </button>

                </div>

            </div>

        </div>
    );
}

export default OrderSuccess;