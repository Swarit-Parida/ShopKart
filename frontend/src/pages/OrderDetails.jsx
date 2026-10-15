import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/orders/${id}`);

        setOrder(response.data.order);
      } catch (error) {
        console.error("Fetch order error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load order"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return <div>Loading order...</div>;
  }

  if (error) {
    return (
      <div>
        <h2>{error}</h2>
        <button onClick={() => navigate("/orders")}>
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div>
      <h1>Order Details</h1>

      <p>
        <strong>Order ID:</strong> {order._id}
      </p>

      <p>
        <strong>Payment:</strong> {order.paymentStatus}
      </p>

      <p>
        <strong>Status:</strong> {order.status}
      </p>

      <h2>Items</h2>

      {order.items.map((item) => (
        <div key={item.product?._id || item.product}>
          <p>
            <strong>{item.name}</strong>
          </p>

          <p>
            Price: ₹{item.price.toFixed(2)}
          </p>

          <p>
            Quantity: {item.quantity}
          </p>

          <p>
            Item Total: ₹
            {(item.price * item.quantity).toFixed(2)}
          </p>

          <hr />
        </div>
      ))}

      <h2>Shipping Address</h2>

      <p>{order.shippingAddress.fullName}</p>
      <p>{order.shippingAddress.phone}</p>
      <p>{order.shippingAddress.addressLine1}</p>
      <p>
        {order.shippingAddress.city},{" "}
        {order.shippingAddress.state}
      </p>
      <p>{order.shippingAddress.pincode}</p>

      <h2>
        Total: ₹{order.totalAmount.toFixed(2)}
      </h2>

      {order.razorpayPaymentId && (
        <p>
          <strong>Payment ID:</strong>{" "}
          {order.razorpayPaymentId}
        </p>
      )}

      <button onClick={() => navigate("/orders")}>
        Back to Orders
      </button>
    </div>
  );
}

export default OrderDetails;