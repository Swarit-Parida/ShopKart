const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} = require("../controllers/cart.controller");

const router = express.Router();

router.post("/:productId", authMiddleware, addToCart);

router.get("/", authMiddleware, getCart);

router.patch("/:productId", authMiddleware, updateCartQuantity);

router.delete("/:productId", authMiddleware, removeFromCart);

module.exports = router;