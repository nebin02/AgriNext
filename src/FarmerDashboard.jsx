import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import styles from "./FarmerDashboard.module.css";
import formatCurrency from "./formatCurrency";

const FarmerDashboard = () => {

    const navigate = useNavigate();

    const [crops, setCrops] = useState([]);
    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);

    const farmerId = localStorage.getItem("userId");


    // ================= GET FARMER CROPS =================

    const getMyCrops = async () => {

        try {

            const response = await api.get(
                `/crops/farmer/${farmerId}`
            );

            console.log("Farmer crops:", response.data);

            /*
             * Your backend may return either:
             * { crops: [...] }
             * or directly [...]
             */

            if (Array.isArray(response.data)) {
                setCrops(response.data);
            } else {
                setCrops(response.data.crops || []);
            }

        } catch (error) {

            console.log("Error getting farmer crops:", error);

        } finally {

            setLoading(false);

        }
    };


    // ================= GET FARMER ORDERS =================

    const getFarmerOrders = async () => {

        try {

            const response = await api.get(
                `/orders/farmer/${farmerId}`
            );

            console.log("Farmer orders:", response.data);

            setOrders(response.data.orders || []);

        } catch (error) {

            console.log("Error getting farmer orders:", error);

        } finally {

            setOrdersLoading(false);

        }
    };


    // ================= LOAD DATA =================

    useEffect(() => {

        if (farmerId) {

            getMyCrops();
            getFarmerOrders();

        } else {

            setLoading(false);
            setOrdersLoading(false);

        }

    }, [farmerId]);


    // ================= TOTAL CROPS =================

    const totalCrops = crops.length;


    // ================= TOTAL QUANTITY =================

    const totalQuantity = crops.reduce(
        (total, crop) => total + Number(crop.quantity || 0),
        0
    );


    // ================= TOTAL SALES =================

    const totalSales = orders.reduce(
        (total, order) => {

            if (order.orderStatus === "Cancelled") {
                return total;
            }

            return total + Number(order.totalAmount || 0);

        },
        0
    );


    // ================= UNIQUE CUSTOMERS =================

    const customerIds = orders
        .filter((order) => order.customerId)
        .map((order) => {

            if (typeof order.customerId === "object") {
                return order.customerId._id;
            }

            return order.customerId;

        });

    const uniqueCustomers = [
        ...new Set(customerIds)
    ];

    const totalCustomers = uniqueCustomers.length;


    // ================= LOGOUT =================

    const handleLogout = () => {

        localStorage.removeItem("userId");
        localStorage.removeItem("userType");

        navigate("/signin");

    };


    return (

        <div className={styles.page}>

            {/* ================= NAVBAR ================= */}

            <nav className={styles.navbar}>

                <div className={styles.logo}>
                    ðŸŒ± AgriNext
                </div>

                <div className={styles.navLinks}>

                    <button
                        className={styles.navButton}
                    >
                        Dashboard
                    </button>

                    <button
                        className={styles.navButton}
                        onClick={() => navigate("/add-crop")}
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


            {/* ================= MAIN ================= */}

            <main className={styles.container}>

                {/* ================= WELCOME ================= */}

                <section className={styles.welcome}>

                    <div>

                        <p className={styles.smallTitle}>
                            FARMER DASHBOARD
                        </p>

                        <h1>
                            Welcome back, Farmer ðŸŒ¾
                        </h1>

                        <p className={styles.welcomeText}>
                            Manage your crops, check your listings
                            and connect with customers.
                        </p>

                    </div>

                    <div className={styles.welcomeIcon}>
                        ðŸŒ±
                    </div>

                </section>


                {/* ================= STATISTICS ================= */}

                <section className={styles.statsGrid}>

                    {/* TOTAL CROPS */}

                    <div className={styles.statCard}>

                        <div className={styles.statIcon}>
                            ðŸŒ¾
                        </div>

                        <div>

                            <p>Total Crops</p>

                            <h2>
                                {loading ? "..." : totalCrops}
                            </h2>

                        </div>

                    </div>


                    {/* TOTAL QUANTITY */}

                    <div className={styles.statCard}>

                        <div className={styles.statIcon}>
                            ðŸ“¦
                        </div>

                        <div>

                            <p>Total Quantity</p>

                            <h2>
                                {loading
                                    ? "..."
                                    : `${totalQuantity} KG`
                                }
                            </h2>

                        </div>

                    </div>


                    {/* TOTAL SALES */}

                    <div className={styles.statCard}>

                        <div className={styles.statIcon}>
                            ðŸ’°
                        </div>

                        <div>

                            <p>Total Sales</p>

                            <h2>
                                {ordersLoading
                                    ? "..."
                                    : formatCurrency(totalSales)
                                }
                            </h2>

                        </div>

                    </div>


                    {/* CUSTOMERS */}

                    <div className={styles.statCard}>

                        <div className={styles.statIcon}>
                            ðŸ‘¥
                        </div>

                        <div>

                            <p>Customers</p>

                            <h2>
                                {ordersLoading
                                    ? "..."
                                    : totalCustomers
                                }
                            </h2>

                        </div>

                    </div>

                </section>


                {/* ================= QUICK ACTIONS ================= */}

                <section className={styles.section}>

                    <div className={styles.sectionHeader}>

                        <div>

                            <p className={styles.sectionTitle}>
                                QUICK ACTIONS
                            </p>

                            <h2>
                                Manage Your Farm
                            </h2>

                        </div>

                    </div>


                    <div className={styles.actionGrid}>

                        {/* ADD CROP */}

                        <button
                            className={styles.actionCard}
                            onClick={() => navigate("/add-crop")}
                        >

                            <div className={styles.actionIcon}>
                                âž•
                            </div>

                            <div>

                                <h3>
                                    Add New Crop
                                </h3>

                                <p>
                                    Add a crop to your farm listing.
                                </p>

                            </div>

                            <span className={styles.arrow}>
                                â†’
                            </span>

                        </button>


                        {/* MY CROPS */}

                        <button
                            className={styles.actionCard}
                            onClick={() => navigate("/my-crops")}
                        >

                            <div className={styles.actionIcon}>
                                ðŸŒ±
                            </div>

                            <div>

                                <h3>
                                    My Crops
                                </h3>

                                <p>
                                    View and manage your crop listings.
                                </p>

                            </div>

                            <span className={styles.arrow}>
                                â†’
                            </span>

                        </button>


                        {/* ORDERS */}

                        <button
                            className={styles.actionCard}
                            onClick={() => navigate("/farmer-orders")}
                        >

                            <div className={styles.actionIcon}>
                                ðŸ“‹
                            </div>

                            <div>

                                <h3>
                                    Orders
                                </h3>

                                <p>
                                    Check customer crop orders.
                                </p>

                            </div>

                            <span className={styles.arrow}>
                                â†’
                            </span>

                        </button>

                    </div>

                </section>


                {/* ================= CUSTOMER ORDERS ================= */}

                <section className={styles.cropSection}>

                    <div className={styles.cropHeader}>

                        <div>

                            <p className={styles.sectionTitle}>
                                CUSTOMER ORDERS
                            </p>

                            <h2>
                                Recent Orders
                            </h2>

                        </div>

                        <button
                            className={styles.viewButton}
                            onClick={() => navigate("/farmer-orders")}
                        >
                            View All â†’
                        </button>

                    </div>


                    {ordersLoading ? (

                        <div className={styles.emptyState}>

                            <div className={styles.emptyIcon}>
                                ðŸ“¦
                            </div>

                            <h3>
                                Loading orders...
                            </h3>

                        </div>

                    ) : orders.length === 0 ? (

                        <div className={styles.emptyState}>

                            <div className={styles.emptyIcon}>
                                ðŸ“¦
                            </div>

                            <h3>
                                No customer orders yet
                            </h3>

                            <p>
                                Orders placed by customers will
                                appear here.
                            </p>

                        </div>

                    ) : (

                        <div className={styles.actionGrid}>

                            {orders.slice(0, 3).map((order) => (

                                <div
                                    className={styles.actionCard}
                                    key={order._id}
                                >

                                    <div className={styles.actionIcon}>
                                        ðŸ“¦
                                    </div>

                                    <div>

                                        <h3>
                                            {order.cropName}
                                        </h3>

                                        <p>
                                            Customer:{" "}
                                            {order.customerId?.name ||
                                                "Customer"}
                                        </p>

                                        <p>
                                            Phone:{" "}
                                            {order.customerId?.phone ||
                                                "Not available"}
                                        </p>

                                        <p>
                                            Quantity:{" "}
                                            {order.quantity}{" "}
                                            {order.unit}
                                        </p>

                                        <p>
                                            Total:{" "}
                                            {formatCurrency(order.totalAmount)}
                                        </p>

                                        <p>
                                            Status:{" "}
                                            {order.orderStatus}
                                        </p>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>


                {/* ================= RECENT CROPS ================= */}

                <section className={styles.cropSection}>

                    <div className={styles.cropHeader}>

                        <div>

                            <p className={styles.sectionTitle}>
                                CROP LISTINGS
                            </p>

                            <h2>
                                My Recent Crops
                            </h2>

                        </div>

                        <button
                            className={styles.viewButton}
                            onClick={() => navigate("/my-crops")}
                        >
                            View All â†’
                        </button>

                    </div>


                    {/* SHOW CROPS */}

                    {loading ? (

                        <div className={styles.emptyState}>

                            <div className={styles.emptyIcon}>
                                ðŸŒ¾
                            </div>

                            <h3>
                                Loading crops...
                            </h3>

                        </div>

                    ) : crops.length === 0 ? (

                        <div className={styles.emptyState}>

                            <div className={styles.emptyIcon}>
                                ðŸŒ¾
                            </div>

                            <h3>
                                No crops added yet
                            </h3>

                            <p>
                                Start adding your crops to make them
                                available to customers.
                            </p>

                            <button
                                className={styles.addButton}
                                onClick={() => navigate("/add-crop")}
                            >
                                + Add Your First Crop
                            </button>

                        </div>

                    ) : (

                        <div className={styles.actionGrid}>

                            {crops.slice(0, 3).map((crop) => (

                                <div
                                    className={styles.actionCard}
                                    key={crop._id}
                                >

                                    {/* ================= CROP IMAGE ================= */}

                                    <div className={styles.cropImageContainer}>

                                        {crop.imageUrl ? (

                                            <img
                                                src={crop.imageUrl}
                                                alt={crop.cropName}
                                                className={styles.cropImage}
                                            />

                                        ) : (

                                            <div className={styles.cropImagePlaceholder}>
                                                ðŸŒ¾
                                            </div>

                                        )}

                                    </div>


                                    {/* ================= CROP DETAILS ================= */}

                                    <div className={styles.cropDetails}>

                                        <h3>
                                            {crop.cropName}
                                        </h3>

                                        <p>
                                            Quantity:{" "}
                                            {crop.quantity}{" "}
                                            {crop.unit}
                                        </p>

                                        <p>
                                            Price: {formatCurrency(crop.price)}
                                        </p>

                                        <p>
                                            Location:{" "}
                                            {crop.location ||
                                                "Not available"}
                                        </p>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>


            {/* ================= FOOTER ================= */}

            <footer className={styles.footer}>

                <div className={styles.footerLogo}>
                    ðŸŒ± AgriNext
                </div>

                <p>
                    Connecting farmers with fresh food.
                </p>

                <p className={styles.copyright}>
                    Â© 2026 AgriNext. All rights reserved.
                </p>

            </footer>

        </div>

    );

};

export default FarmerDashboard;