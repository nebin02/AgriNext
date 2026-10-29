import React, { useEffect, useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";
import styles from "./CustomerCrops.module.css";
import FirstOrderOffer from "./FirstOrderOffer";
import formatCurrency from "./formatCurrency";

const CustomerCrops = () => {

    const navigate = useNavigate();

    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // GET CROPS FROM BACKEND
    // ==========================================

    const getCrops = async () => {

        try {

            const response = await api.get(
                "/crops"
            );

            console.log("CROPS FROM BACKEND:", response.data.crops);

            setCrops(response.data.crops || []);
            setLoading(false);

        } catch (error) {

            console.log(error);

            setError("Unable to load crops.");
            setLoading(false);
        }
    };


    useEffect(() => {
        getCrops();
    }, []);


    // ==========================================
    // ADD CROP TO CART
    // ==========================================

    const addToCart = (crop) => {

        const existingCart = JSON.parse(
            localStorage.getItem("cart") || "[]"
        );

        const alreadyAdded = existingCart.some(
            (item) => item._id === crop._id
        );

        if (alreadyAdded) {

            alert("This crop is already in your cart! 🛒");
            return;
        }

        const updatedCart = [
            ...existingCart,
            crop
        ];

        localStorage.setItem(
            "cart",
            JSON.stringify(updatedCart)
        );

        alert(`${crop.cropName} added to cart 🛒`);
    };


    // ==========================================
    // BUY NOW
    // ==========================================

    const buyNow = (crop) => {

        localStorage.setItem(
            "buyNowCrop",
            JSON.stringify(crop)
        );

        navigate("/checkout");
    };


    // ==========================================
    // VIEW CART
    // ==========================================

    const viewCart = () => {

        navigate("/cart");

    };


    // ==========================================
    // VIEW MY ORDERS
    // ==========================================

    const viewOrders = () => {

        navigate("/orders");

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className={styles.loading}>

                <h2>
                    Loading crops... 🌱
                </h2>

            </div>
        );
    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error) {

        return (
            <div className={styles.error}>

                <h2>
                    {error}
                </h2>

                <button onClick={getCrops}>
                    Try Again
                </button>

            </div>
        );
    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className={styles.container}>

            {/* ==================================
            HEADER
            ================================== */}

            <div className={styles.header}>

                <div>

                    <h1>
                        Available Crops 🌾
                    </h1>

                    <p>
                        Buy fresh crops directly from farmers.
                    </p>

                </div>


                {/* HEADER BUTTONS */}

                <div className={styles.headerButtons}>

                    {/* MY ORDERS */}

                    <button
                        className={styles.ordersButton}
                        onClick={viewOrders}
                    >
                        📦 My Orders
                    </button>


                    {/* VIEW CART */}

                    <button
                        className={styles.viewCartButton}
                        onClick={viewCart}
                    >
                        🛒 View Cart
                    </button>

                </div>

            </div>

            <FirstOrderOffer />

            {/* ==================================
            NO CROPS
            ================================== */}

            {crops.length === 0 ? (

                <div className={styles.noCrops}>

                    <h2>
                        No crops available 🌱
                    </h2>

                    <p>
                        Farmers have not added any crops yet.
                    </p>

                </div>

            ) : (

                /* ==================================
                CROP GRID
                ================================== */

                <div className={styles.cropGrid}>

                    {crops.map((crop) => (

                        <div
                            className={styles.cropCard}
                            key={crop._id}
                        >

                            {/* ==================================
                            CROP IMAGE
                            ================================== */}

                            <div className={styles.cropImageContainer}>

                                {crop.imageUrl ? (

                                    <img
                                        src={crop.imageUrl}
                                        alt={crop.cropName}
                                        className={styles.cropImage}
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.nextElementSibling.style.display = "flex";
                                        }}
                                    />

                                ) : null}


                                {/* FALLBACK ICON */}

                                <div
                                    className={styles.cropIcon}
                                    style={{
                                        display: crop.imageUrl
                                            ? "none"
                                            : "flex"
                                    }}
                                >
                                    🌾
                                </div>

                            </div>


                            {/* CROP NAME */}

                            <h2>
                                {crop.cropName}
                            </h2>


                            {/* CROP DETAILS */}

                            <div className={styles.details}>

                                <p>
                                    <strong>
                                        Quantity:
                                    </strong>{" "}

                                    {crop.quantity} {crop.unit}
                                </p>


                                <p>
                                    <strong>
                                        Price:
                                    </strong>{" "}

                                    {formatCurrency(crop.price)} / {crop.unit}
                                </p>


                                <p>
                                    <strong>
                                        Location:
                                    </strong>{" "}

                                    {crop.location}
                                </p>

                            </div>


                            {/* FARMER INFORMATION */}

                            <div className={styles.farmerBox}>

                                <h3>
                                    👨‍🌾 Farmer Details
                                </h3>


                                <p>
                                    <strong>
                                        Name:
                                    </strong>{" "}

                                    {crop.farmerId?.name ||
                                        "Farmer"}
                                </p>


                                <p>
                                    <strong>
                                        Phone:
                                    </strong>{" "}

                                    {crop.farmerId?.phone ||
                                        "Not available"}
                                </p>

                            </div>


                            {/* BUTTONS */}

                            <div className={styles.buttonGroup}>

                                {/* ADD TO CART */}

                                <button
                                    className={styles.cartButton}
                                    onClick={() =>
                                        addToCart(crop)
                                    }
                                >
                                    🛒 Add to Cart
                                </button>


                                {/* BUY NOW */}

                                <button
                                    className={styles.buyButton}
                                    onClick={() =>
                                        buyNow(crop)
                                    }
                                >
                                    ⚡ Buy Now
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
};


export default CustomerCrops;