const express = require("express");
const Razorpay = require("razorpay");

const {
    registerFarmer,
    registerCustomer, addCrop,
    getFarmerCrops,
    getCrops,
    placeOrder,
    getFarmerNotifications,
    getCustomerOrders,
    getFarmerOrders,
    markOrderDelivered,
    verifyOTP,
    sendOTP,
    forgotPassword,
    verifyForgotPasswordOTP,
    resetPassword
} = require("./controller");
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});
const { signin } = require("./signincontroller");

const router = express.Router();

router.post("/farmer/register", registerFarmer);

router.post("/customer/register", registerCustomer);
router.post("/crop/add", addCrop);
router.post("/signin", signin);
router.get("/crops/farmer/:farmerId", getFarmerCrops);
router.get("/crops", getCrops);
router.post("/order/place", placeOrder);
router.get("/notifications/farmer/:farmerId", getFarmerNotifications);
router.get("/orders/customer/:customerId", getCustomerOrders);
router.get("/orders/farmer/:farmerId",getFarmerOrders);
router.put("/order/delivered/:orderId",markOrderDelivered);

router.put("/order/delivered/:orderId", markOrderDelivered);
router.post("/verify-otp", verifyOTP);
router.post("/send-otp", sendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-password-otp",verifyForgotPasswordOTP);
router.post("/reset-password",resetPassword);

// Razorpay
router.post("/payment/create", async (req, res) => {
    try {
        const { amount } = req.body;

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: "receipt_" + Date.now()
        });

        res.json({
            success: true,
            order: order
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Payment order creation failed"
        });
    }
});


module.exports = router;