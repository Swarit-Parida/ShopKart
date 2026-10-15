
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { loadEnvFile } = require("node:process");
const mongoose = require("mongoose");

// Load .env locally if present; Render supplies environment variables.
try {
  loadEnvFile();
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/customers", require("./routes/customer.routes"));
app.use("/products", require("./routes/product.routes"));
app.use("/wishlist", require("./routes/wishlist.routes"));
app.use("/cart", require("./routes/cart.routes"));
app.use("/orders", require("./routes/order.routes"));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "ShopKart backend is running",
  });
});

// Database and server
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`ShopKart server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
