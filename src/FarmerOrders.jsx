import React, { useEffect, useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";
import styles from "./FarmerOrders.module.css";
import formatCurrency from "./formatCurrency";
import Popup from "./Popup";

const FarmerOrders = () => {

    const navigate = useNavigate();

    // ================= POPUP =================

    const [popupMessage, setPopupMessage] = useState("");

    // ================= ORDERS =================

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const farmerId = localStorage.getItem("userId");

    // =====================================================
    // GET FARMER ORDERS
    // =====================================================

    const getFarmerOrders = async () => {

        try {

            setLoading(true);
            setError("");

            if (!farmerId) {

                setError("Please login as a farmer.");

                setLoading(false);

                return;
            }

            const response = await api.get(
                `/orders/farmer/${farmerId}`
            );

            console.log("Farmer orders:", response.data);

            setOrders(response.data.orders || []);

        } catch (error) {

            console.log("Get farmer orders error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load orders."
            );

        } finally {

            setLoading(false);

        }
    };

    // =====================================================
    // LOAD ORDERS
    // =====================================================

    useEffect(() => {

        getFarmerOrders();

    }, []);

    // =====================================================
    // MARK ORDER AS DELIVERED
    // =====================================================

    const markAsDelivered = async (orderId) => {

        try {

            setUpdatingId(orderId);

            const response = await api.put(
                `/order/delivered/${orderId}`
            );

            console.log("Delivered response:", response.data);

            setOrders((previousOrders) =>
                previousOrders.map((order) =>
                    order._id === orderId
                        ? {
                            ...order,
                            orderStatus: "Delivered"
                        }
                        : order
                )
            );

            setPopupMessage(
                "Order has been marked as delivered! ðŸŽ‰"
            );

        } catch (error) {

            console.log("Update delivery error:", error);

            setPopupMessage(
                error.response?.data?.message ||
                "Unable to update order."
            );

        } finally {

            setUpdatingId(null);

        }
    };
    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        localStorage.removeItem("userId");
        localStorage.removeItem("userType");

        navigate("/signin");

    };

    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className={styles.page}>

            {/* =================================================
                NAVBAR
            ================================================= */}

            <nav className={styles.navbar}>

                <div className={styles.logo}>
                    ðŸŒ± AgriNext
                </div>

                <div className={styles.navLinks}>

                    <button
                        className={styles.navButton}
                        onClick={() =>
                            navigate("/farmer-dashboard")
                        }
                    >
                        Dashboard
                    </button>

                    <button
                        className={styles.navButton}
                        onClick={() =>
                            navigate("/add-crop")
                        }
                    >
                        Add Crop
                    </button>

                    <button
                        className={styles.logoutButton}
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className={styles.container}>

                {/* ================= HEADER ================= */}

                <div className={styles.header}>

                    <div>

                        <p className={styles.smallTitle}>
                            FARMER ORDERS
                        </p>

                        <h1>
                            Customer Orders ðŸ“¦
                        </h1>

                        <p>
                            View orders placed by customers
                            for your crops.
                        </p>

                    </div>

                    <button
                        className={styles.backButton}
                        onClick={() =>
                            navigate("/farmer-dashboard")
                        }
                    >
                        â† Dashboard
                    </button>

                </div>

                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (

                    <div className={styles.messageBox}>

                        <h2>
                            Loading orders... ðŸ“¦
                        </h2>

                    </div>

                )}

                {/* =================================================
                    ERROR
                ================================================= */}

                {!loading && error && (

                    <div className={styles.messageBox}>

                        <h2>
                            {error}
                        </h2>

                        <button
                            onClick={getFarmerOrders}
                        >
                            Try Again
                        </button>

                    </div>

                )}

                {/* =================================================
                    NO ORDERS
                ================================================= */}

                {!loading &&
                    !error &&
                    orders.length === 0 && (

                        <div className={styles.messageBox}>

                            <div className={styles.emptyIcon}>
                                ðŸ“¦
                            </div>

                            <h2>
                                No Orders Yet
                            </h2>

                            <p>
                                When customers buy your crops,
                                their orders will appear here.
                            </p>

                        </div>

                    )}

                {/* =================================================
                    ORDERS
                ================================================= */}

                {!loading &&
                    !error &&
                    orders.length > 0 && (

                        <div className={styles.orderGrid}>

                            {orders.map((order) => (

                                <div
                                    className={styles.orderCard}
                                    key={order._id}
                                >

                                    {/* =========================
                                        ORDER HEADER
                                    ========================= */}

                                    <div
                                        className={styles.orderHeader}
                                    >

                                        <div>

                                            <h2>
                                                ðŸŒ¾ {order.cropName}
                                            </h2>

                                            <small>
                                                Order ID: {order._id}
                                            </small>

                                        </div>

                                        <span
                                            className={styles.status}
                                        >
                                            {order.orderStatus}
                                        </span>

                                    </div>

                                    {/* =========================
                                        CUSTOMER DETAILS
                                    ========================= */}

                                    <div
                                        className={styles.customerBox}
                                    >

                                        <h3>
                                            ðŸ‘¤ Customer Details
                                        </h3>

                                        <p>

                                            <strong>
                                                Name:
                                            </strong>{" "}

                                            {order.customerName ||
                                                order.customerId?.name ||
                                                "Name not available"}

                                        </p>

                                        <p>

                                            <strong>
                                                Phone:
                                            </strong>{" "}

                                            {order.customerPhone ||
                                                order.customerId?.phone ||
                                                "Phone not available"}

                                        </p>

                                        <p>

                                            <strong>
                                                Email:
                                            </strong>{" "}

                                            {order.customerEmail ||
                                                order.customerId?.email ||
                                                "Email not available"}

                                        </p>

                                        <p>

                                            <strong>
                                                Address:
                                            </strong>{" "}

                                            {order.address ||
                                                "Address not available"}

                                        </p>

                                    </div>

                                    {/* =========================
                                        ORDER DETAILS
                                    ========================= */}

                                    <div
                                        className={styles.details}
                                    >

                                        <div>

                                            <span>
                                                ðŸ“¦ Quantity
                                            </span>

                                            <strong>
                                                {order.quantity}{" "}
                                                {order.unit}
                                            </strong>

                                        </div>

                                        <div>

                                            <span>
                                                ðŸ’° Price
                                            </span>

                                            <strong>
                                                {formatCurrency(order.price)} /{" "}
                                                {order.unit}
                                            </strong>

                                        </div>

                                        <div>

                                            <span>
                                                ðŸ’µ Total
                                            </span>

                                            <strong>
                                                {formatCurrency(order.totalAmount)}
                                            </strong>

                                        </div>

                                        <div>

                                            <span>
                                                ðŸ’³ Payment
                                            </span>

                                            <strong>
                                                {order.paymentMethod}
                                            </strong>

                                        </div>

                                        <div>

                                            <span>
                                                ðŸ’³ Payment Status
                                            </span>

                                            <strong>
                                                {order.paymentStatus}
                                            </strong>

                                        </div>

                                    </div>

                                    {/* =========================
                                        DELIVERY ADDRESS
                                    ========================= */}

                                    <div
                                        className={styles.address}
                                    >

                                        <h3>
                                            ðŸ“ Delivery Address
                                        </h3>

                                        <p>
                                            {order.address ||
                                                "Address not available"}
                                        </p>

                                    </div>

                                    {/* =========================
                                        DELIVERY BUTTON
                                    ========================= */}

                                    <div
                                        className={
                                            styles.deliverySection
                                        }
                                    >

                                        {order.orderStatus ===
                                            "Delivered" ? (

                                            <div
                                                className={
                                                    styles.deliveredMessage
                                                }
                                            >
                                                âœ… Order Delivered
                                            </div>

                                        ) : (

                                            <button
                                                className={
                                                    styles.deliveredButton
                                                }
                                                onClick={() =>
                                                    markAsDelivered(
                                                        order._id
                                                    )
                                                }
                                                disabled={
                                                    updatingId ===
                                                    order._id
                                                }
                                            >

                                                {updatingId ===
                                                    order._id
                                                    ? "Updating..."
                                                    : "ðŸšš Mark as Delivered"}

                                            </button>

                                        )}

                                    </div>

                                    {/* =========================
                                        ORDER DATE
                                    ========================= */}

                                    <div
                                        className={styles.date}
                                    >

                                        Ordered on:{" "}

                                        {order.createdAt
                                            ? new Date(
                                                order.createdAt
                                            ).toLocaleString()
                                            : "Date not available"}

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

            </main>
            <Popup
                message={popupMessage}
                onClose={() => setPopupMessage("")}
            />

            {/* =================================================
                POPUP
                IMPORTANT: ONLY ONE POPUP FOR THE WHOLE PAGE
            ================================================= */}


        </div>
    );
};

export default FarmerOrders;