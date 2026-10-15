import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(`/products/${id}`);

                setProduct(response.data.product);
            } catch (error) {
                console.log(error);

                setError("Something went wrong while loading the product.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return <p>Loading product...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!product) {
        return <p>Product not found.</p>;
    }

    return (
        <div className="product-details">

            <button onClick={() => navigate("/products")}>
                ← Back to Products
            </button>

            <div className="product-details-content">

                <img
                    src={
                        product.name === "Mechanical Keyboard"
                            ? "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80"
                            : product.image
                    }
                    alt={product.name}
                    className="product-details-image"
                />

                <div className="product-details-info">

                    <h1>{product.name}</h1>

                    <p className="product-category">
                        {product.category}
                    </p>

                    <p className="product-description">
                        {product.description}
                    </p>

                    <h2>₹{product.price}</h2>

                    <p>
                        {product.stock > 0
                            ? `${product.stock} units available`
                            : "Out of stock"}
                    </p>

                    <button disabled={product.stock === 0}>
                        Add to Cart
                    </button>

                </div>

            </div>

        </div>
    );
}

export default ProductDetails;