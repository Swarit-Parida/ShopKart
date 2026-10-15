const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const { loadEnvFile } = require("node:process");
const mongoose = require("mongoose");

loadEnvFile();

const app = express();

// Allow requests from the React frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware to read JSON request bodies
app.use(express.json());
app.use(cookieParser());

// Customer routes
const customerRoutes = require("./routes/customer.routes");

app.use("/customers", customerRoutes);

// Product routes
const productRoutes = require("./routes/product.routes");

app.use("/products", productRoutes);

// Wishlist routes
const wishlistRoutes = require("./routes/wishlist.routes");

app.use("/wishlist", wishlistRoutes);

// Cart routes
const cartRoutes = require("./routes/cart.routes");

app.use("/cart", cartRoutes);

// Order routes
const orderRoutes = require("./routes/order.routes");

app.use("/orders", orderRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(3000, () => {
      console.log("Server running on http://localhost:3000");
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed");
    console.log(error.message);
  });