import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Cart.module.css";
import formatCurrency from "./formatCurrency";

const Cart = () => {

    const navigate = useNavigate();

    const [cart, setCart] = useState([]);


    // Get cart from localStorage
    useEffect(() => {

        const savedCart = JSON.parse(
            localStorage.getItem("cart") || "[]"
        );

        setCart(savedCart);

    }, []);


    // Remove item
    const removeFromCart = (id) => {

        const updatedCart = cart.filter(
            (item) => item._id !== id
        );

        setCart(updatedCart);

        localStorage.setItem(
            "cart",
            JSON.stringify(updatedCart)
        );
    };


    // Calculate total
    const total = cart.reduce(
        (sum, item) => sum + Number(item.price || 0),
        0
    );


    return (

        <div className={styles.container}>

            <div className={styles.header}>

                <h1>🛒 My Cart</h1>

                <button
                    className={styles.backButton}
                    onClick={() => navigate("/customer-crops")}
                >
                    ← Continue Shopping
                </button>

            </div>


            {cart.length === 0 ? (

                <div className={styles.emptyCart}>

                    <div className={styles.emptyIcon}>
                        🛒
                    </div>

                    <h2>
                        Your cart is empty
                    </h2>

                    <p>
                        Add some crops to your cart.
                    </p>

                    <button
                        className={styles.shopButton}
                        onClick={() => navigate("/customer-crops")}
                    >
                        View Crops
                    </button>

                </div>

            ) : (

                <>

                    <div className={styles.cartGrid}>

                        {cart.map((crop) => (

                            <div
                                className={styles.cartCard}
                                key={crop._id}
                            >

                                <div className={styles.cropIcon}>
                                    🌾
                                </div>

                                <div className={styles.cropInfo}>

                                    <h2>
                                        {crop.cropName}
                                    </h2>

                                    <p>
                                        📦 Available:
                                        {" "}
                                        {crop.quantity} {crop.unit}
                                    </p>

                                    <p>
                                        💰 Price:
                                        {" "}
                                        {formatCurrency(crop.price)} / {crop.unit}
                                    </p>

                                    <p>
                                        📍 {crop.location}
                                    </p>

                                    <p>
                                        👨‍🌾 Farmer:
                                        {" "}
                                        {crop.farmerId?.name ||
                                            "Not available"}
                                    </p>

                                    <p>
                                        📞 Phone:
                                        {" "}
                                        {crop.farmerId?.phone ||
                                            "Not available"}
                                    </p>

                                </div>

                                <button
                                    className={styles.removeButton}
                                    onClick={() =>
                                        removeFromCart(crop._id)
                                    }
                                >
                                    Remove
                                </button>

                            </div>

                        ))}

                    </div>


                    {/* CART SUMMARY */}

                    <div className={styles.summary}>

                        <h2>
                            Cart Summary
                        </h2>

                        <div className={styles.summaryRow}>

                            <span>
                                Items
                            </span>

                            <strong>
                                {cart.length}
                            </strong>

                        </div>

                        <div className={styles.summaryRow}>

                            <span>
                                Total
                            </span>

                            <strong>
                                {formatCurrency(total)}
                            </strong>

                        </div>

                      <button
    onClick={() => navigate("/checkout")}

>
    Proceed to Checkout
</button>

                    </div>

                </>

            )}

        </div>

    );

};

export default Cart;