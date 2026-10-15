const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");

const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
} = require("../controllers/order.controller");

const router = express.Router();

// Create ShopKart pending order + Razorpay order
router.post(
  "/create-payment-order",
  authMiddleware,
  createPaymentOrder
);

// Verify Razorpay payment
router.post(
  "/verify-payment",
  authMiddleware,
  verifyPayment
);

router.get(
  "/",
  authMiddleware,
  getMyOrders
);

router.get(
  "/:id",
  authMiddleware,
  getOrderById
);

module.exports = router;