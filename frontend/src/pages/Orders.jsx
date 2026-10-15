import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/orders");

        setOrders(response.data.orders || []);
      } catch (error) {
        console.error("Fetch orders error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load orders"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <p className="orders-loading">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-error">
            <h2>Unable to load orders</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-empty">
            <h2>No orders yet</h2>
            <p>Your completed orders will appear here.</p>

            <button
              className="primary-btn"
              onClick={() => navigate("/products")}
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>View your order history and payment status.</p>
        </div>

        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-card-header">
                <h3>Order #{order._id}</h3>

                <span
                  className={`order-status ${
                    order.status === "PLACED"
                      ? "status-placed"
                      : "status-pending"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="order-info">
                <div>
                  <span>Order Total</span>
                  <strong>
                    ₹{order.totalAmount.toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>Payment</span>
                  <strong>{order.paymentStatus}</strong>
                </div>

                <div>
                  <span>Items</span>
                  <strong>
                    {order.items.reduce(
                      (total, item) =>
                        total + item.quantity,
                      0
                    )}
                  </strong>
                </div>
              </div>

              <button
                className="view-order-btn"
                onClick={() =>
                  navigate(`/orders/${order._id}`)
                }
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Orders;