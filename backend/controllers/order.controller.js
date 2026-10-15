const crypto = require("crypto");

const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const razorpay = require("../config/razorpay");

// =====================================================
// POST /orders/create-payment-order
// =====================================================

const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // -----------------------------------
    // 1. Validate shipping address
    // -----------------------------------

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const {
      fullName,
      phone,
      addressLine1,
      city,
      state,
      pincode,
    } = shippingAddress;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !addressLine1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All shipping fields are required",
      });
    }

    // Phone validation
    if (!/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain 10 digits",
      });
    }

    // Pincode validation
    if (!/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Pincode must contain 6 digits",
      });
    }

    // -----------------------------------
    // 2. Get authenticated user's cart
    // -----------------------------------

    const customer = await Customer.findById(req.user._id).populate(
      "cart.product"
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // -----------------------------------
    // 3. Check cart is not empty
    // -----------------------------------

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // -----------------------------------
    // 4. Validate products + stock
    // -----------------------------------

    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = cartItem.product;

      // Product was deleted after being
      // added to cart
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart no longer exists",
        });
      }

      // Check stock again
      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      // Calculate using CURRENT product price
      const itemTotal = product.price * cartItem.quantity;

      totalAmount += itemTotal;

      // Create order snapshot
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });
    }

    // -----------------------------------
    // 5. Create ShopKart pending order
    // -----------------------------------

    const order = await Order.create({
      user: customer._id,

      items: orderItems,

      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },

      totalAmount,

      paymentStatus: "PENDING",

      status: "PENDING_PAYMENT",
    });

    // -----------------------------------
    // 6. Create Razorpay Order
    // -----------------------------------

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: order._id.toString(),
    });

    // -----------------------------------
    // 7. Save Razorpay Order ID
    // -----------------------------------

    order.razorpayOrderId = razorpayOrder.id;

    await order.save();

    // -----------------------------------
    // 8. Send safe data to frontend
    // -----------------------------------

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully",

      shopKartOrderId: order._id,

      razorpayOrderId: razorpayOrder.id,

      amount: razorpayOrder.amount,

      currency: razorpayOrder.currency,

      // Key ID is safe to send to frontend
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create payment order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};

// =====================================================
// POST /orders/verify-payment
// =====================================================

const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // -----------------------------------
    // 1. Validate required fields
    // -----------------------------------

    if (
      !shopKartOrderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are required",
      });
    }

    // -----------------------------------
    // 2. Find the ShopKart order
    // -----------------------------------

    const order = await Order.findById(shopKartOrderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // -----------------------------------
    // 3. Make sure the order belongs
    //    to the logged-in customer
    // -----------------------------------

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this order",
      });
    }

    // -----------------------------------
    // 4. Prevent duplicate payment
    //    verification
    // -----------------------------------

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Order has already been paid",
      });
    }

    // -----------------------------------
    // 5. Make sure Razorpay order ID
    //    matches our database
    // -----------------------------------

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID does not match",
      });
    }

    // -----------------------------------
    // 6. Create signature payload
    // -----------------------------------

    const body =
      order.razorpayOrderId + "|" + razorpay_payment_id;

    // -----------------------------------
    // 7. Generate expected signature
    // -----------------------------------

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");

    // -----------------------------------
    // 8. Compare signatures
    // -----------------------------------

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // -----------------------------------
    // 9. Mark order as paid
    // -----------------------------------

    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;

    await order.save();

    // -----------------------------------
    // 10. Clear customer's cart
    // -----------------------------------

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    customer.cart = [];

    await customer.save();

    // -----------------------------------
    // 11. Return confirmed order
    // -----------------------------------

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
};

// =====================================================
// GET /orders
// =====================================================

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// =====================================================
// GET /orders/:id
// =====================================================

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name price image");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Make sure the order belongs to
    // the logged-in customer
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this order",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
};