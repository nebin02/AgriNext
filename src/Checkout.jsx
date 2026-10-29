import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import styles from "./Checkout.module.css";
import Popup from "./Popup";
import FirstOrderOffer from "./FirstOrderOffer";
import formatCurrency from "./formatCurrency";

const Checkout = () => {

    const navigate = useNavigate();

    // ================= POPUP =================

    const [popupMessage, setPopupMessage] = useState("");

    // ================= CROP =================

    const [crop, setCrop] = useState(null);

    // ================= CUSTOMER =================

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");

    // ================= ORDER =================

    const [quantity, setQuantity] = useState(1);
    const [address, setAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");

    // ================= LOADING =================

    const [loading, setLoading] = useState(false);

    // ================= MESSAGE =================

    const [message, setMessage] = useState("");

    // =====================================================
    // LOAD CROP + RAZORPAY
    // =====================================================

    useEffect(() => {

        const savedCrop = JSON.parse(
            localStorage.getItem("buyNowCrop") || "null"
        );

        setCrop(savedCrop);

        // Load Razorpay
        const script = document.createElement("script");

        script.src =
            "https://checkout.razorpay.com/v1/checkout.js";

        script.onload = () => {
            console.log("Razorpay loaded successfully");
        };

        script.onerror = () => {
            console.log("Razorpay failed to load");
        };

        document.body.appendChild(script);

    }, []);

    // =====================================================
    // NO CROP
    // =====================================================

    if (!crop) {

        return (

            <div className={styles.empty}>

                <h2>
                    No crop selected
                </h2>

                <button
                    onClick={() =>
                        navigate("/customer-crops")
                    }
                >
                    Go Back
                </button>

            </div>

        );
    }

    // =====================================================
    // TOTAL
    // =====================================================

    const totalAmount =
        Number(crop.price) * Number(quantity);

    // =====================================================
    // PLACE ORDER
    // =====================================================

    const placeOrder = async () => {

        setMessage("");

        // ================= CUSTOMER NAME =================

        if (!customerName.trim()) {

            setMessage(
                "Please enter your name."
            );

            return;
        }

        // ================= PHONE =================

        if (!customerPhone.trim()) {

            setMessage(
                "Please enter your phone number."
            );

            return;
        }

        // ================= PHONE VALIDATION =================

        const phoneRegex = /^[6-9]\d{9}$/;

        if (!phoneRegex.test(customerPhone)) {

            setMessage(
                "Please enter a valid 10-digit phone number."
            );

            return;
        }

        // ================= ADDRESS =================

        if (!address.trim()) {

            setMessage(
                "Please enter your delivery address."
            );

            return;
        }

        // ================= PAYMENT =================

        if (!paymentMethod) {

            setMessage(
                "Please select a payment method."
            );

            return;
        }

        // ================= QUANTITY =================

        if (Number(quantity) <= 0) {

            setMessage(
                "Please enter a valid quantity."
            );

            return;
        }

        // ================= AVAILABLE QUANTITY =================

        if (
            Number(quantity) >
            Number(crop.quantity)
        ) {

            setMessage(
                `Only ${crop.quantity} ${crop.unit} available.`
            );

            return;
        }

        // ================= CUSTOMER ID =================

        const customerId =
            localStorage.getItem("userId");

        if (!customerId) {

            setMessage(
                "Please login before placing an order."
            );

            return;
        }

        // ================= FARMER ID =================

        const farmerId =
            crop.farmerId?._id ||
            crop.farmerId;

        if (!farmerId) {

            setMessage(
                "Farmer information is missing."
            );

            return;
        }

        // =====================================================
        // ORDER DATA
        // =====================================================

        const orderData = {

            customerId: customerId,

            customerName:
                customerName.trim(),

            customerPhone:
                customerPhone.trim(),

            farmerId: farmerId,

            cropId: crop._id,

            quantity: Number(quantity),

            address: address.trim(),

            paymentMethod: paymentMethod
        };

        try {

            setLoading(true);

            // =================================================
            // CASH ON DELIVERY
            // =================================================

            if (paymentMethod === "COD") {

                const response = await api.post(
                    "/order/place",
                    orderData
                );

                console.log(
                    "COD Order:",
                    response.data
                );

                // Remove old message
                setMessage("");

                // Show popup
                setPopupMessage(
                    "Your order has been placed successfully! ðŸŽ‰"
                );

                localStorage.removeItem(
                    "buyNowCrop"
                );

                localStorage.removeItem(
                    "latestOrder"
                );

                // IMPORTANT:
                // Do NOT navigate immediately.
                // Popup will handle navigation.
                return;
            }

            // =================================================
            // RAZORPAY / UPI
            // =================================================

            if (paymentMethod === "UPI") {

                // Create Razorpay order
                const paymentResponse =
                    await api.post(
                        "/payment/create",
                        {
                            amount: totalAmount
                        }
                    );

                console.log(
                    "Payment order:",
                    paymentResponse.data
                );

                const razorpayOrder =
                    paymentResponse.data.order;

                // =================================================
                // RAZORPAY OPTIONS
                // =================================================

                const options = {

                    // Replace with your Razorpay TEST KEY ID
                    key: "YOUR_RAZORPAY_KEY_ID",

                    amount:
                        razorpayOrder.amount,

                    currency: "INR",

                    name: "AgriNext",

                    description:
                        "AgriNext Crop Purchase",

                    order_id:
                        razorpayOrder.id,

                    // =================================================
                    // PAYMENT SUCCESS
                    // =================================================

                    handler: async function (
                        paymentResult
                    ) {

                        try {

                            console.log(
                                "Payment successful:",
                                paymentResult
                            );

                            // Save AgriNext order
                            const orderResponse =
                                await api.post(
                                    "/order/place",
                                    orderData
                                );

                            console.log(
                                "Order saved:",
                                orderResponse.data
                            );

                            // Show popup
                            setPopupMessage(
                                "Payment successful! Your order has been placed successfully! ðŸŽ‰"
                            );

                            localStorage.removeItem(
                                "buyNowCrop"
                            );

                            localStorage.removeItem(
                                "latestOrder"
                            );

                        } catch (error) {

                            console.log(
                                "Order save error:",
                                error
                            );

                            setPopupMessage(
                                error.response?.data?.message ||
                                "Payment was successful, but order could not be saved."
                            );
                        }
                    },

                    // =================================================
                    // CUSTOMER DETAILS
                    // =================================================

                    prefill: {

                        name:
                            customerName,

                        contact:
                            customerPhone

                    },

                    // =================================================
                    // RAZORPAY THEME
                    // =================================================

                    theme: {

                        color: "#2e7d32"

                    }

                };

                // =================================================
                // OPEN RAZORPAY
                // =================================================

                const razorpay =
                    new window.Razorpay(options);

                razorpay.open();

                return;
            }

        } catch (error) {

            console.log(
                "Payment / Order error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Unable to complete payment."
            );

        } finally {

            setLoading(false);

        }
    };

    // =====================================================
    // POPUP OK BUTTON
    // =====================================================

    const handlePopupClose = () => {

        setPopupMessage("");

        navigate("/orders");

    };

    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className={styles.page}>

            <div className={styles.container}>

                {/* ================= HEADER ================= */}

                <div className={styles.header}>

                    <button
                        onClick={() =>
                            navigate("/customer-crops")
                        }
                        className={styles.backButton}
                    >
                        â† Back
                    </button>

                    <h1>
                        Checkout ðŸ›’
                    </h1>

                </div>

                <FirstOrderOffer />

                <div className={styles.checkoutGrid}>

                    {/* =================================================
                        CROP
                    ================================================= */}

                    <div className={styles.card}>

                        <h2>
                            ðŸŒ¾ Crop Details
                        </h2>

                        <div className={styles.cropInfo}>

                            <h3>
                                {crop.cropName}
                            </h3>

                            <p>
                                Price: {formatCurrency(crop.price)} / {crop.unit}
                            </p>

                            <p>
                                Available:{" "}
                                {crop.quantity} {crop.unit}
                            </p>

                        </div>

                        {/* QUANTITY */}

                        <div className={styles.inputGroup}>

                            <label>
                                Quantity
                            </label>

                            <input
                                type="number"
                                min="1"
                                max={crop.quantity}
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        {/* TOTAL */}

                        <div className={styles.total}>

                            <span>
                                Crop subtotal (before any offer)
                            </span>

                            <strong>
                                {formatCurrency(totalAmount)}
                            </strong>

                        </div>

                    </div>

                    {/* =================================================
                        CUSTOMER
                    ================================================= */}

                    <div className={styles.card}>

                        <h2>
                            ðŸ‘¤ Customer Details
                        </h2>

                        {/* NAME */}

                        <div className={styles.inputGroup}>

                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={customerName}
                                onChange={(e) =>
                                    setCustomerName(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        {/* PHONE */}

                        <div className={styles.inputGroup}>

                            <label>
                                Phone Number
                            </label>

                            <input
                                type="tel"
                                placeholder="Enter 10-digit phone number"
                                value={customerPhone}
                                maxLength="10"
                                onChange={(e) =>
                                    setCustomerPhone(
                                        e.target.value.replace(
                                            /\D/g,
                                            ""
                                        )
                                    )
                                }
                            />

                        </div>

                        {/* ADDRESS */}

                        <div className={styles.inputGroup}>

                            <label>
                                Delivery Address
                            </label>

                            <textarea
                                placeholder="Enter your delivery address"
                                value={address}
                                onChange={(e) =>
                                    setAddress(
                                        e.target.value
                                    )
                                }
                                rows="4"
                            />

                        </div>

                        {/* PAYMENT */}

                        <div className={styles.inputGroup}>

                            <label>
                                Payment Method
                            </label>

                            <select
                                value={paymentMethod}
                                onChange={(e) =>
                                    setPaymentMethod(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Select Payment Method
                                </option>

                                <option value="COD">
                                    Cash on Delivery
                                </option>

                                <option value="UPI">
                                    UPI / Razorpay
                                </option>

                            </select>

                        </div>

                        {/* MESSAGE */}

                        {message && (

                            <p className={styles.message}>
                                {message}
                            </p>

                        )}

                        {/* PLACE ORDER */}

                        <button
                            className={
                                styles.placeOrderButton
                            }
                            onClick={placeOrder}
                            disabled={loading}
                        >

                            {loading
                                ? "Processing..."
                                : "Place Order ðŸŽ‰"}

                        </button>

                    </div>

                </div>

            </div>

            {/* =================================================
                ORDER SUCCESS POPUP
            ================================================= */}

            <Popup
                message={popupMessage}
                onClose={handlePopupClose}
            />

        </div>

    );

};

export default Checkout;