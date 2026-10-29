import React, { useEffect, useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";
import styles from "./Order.module.css";
import formatCurrency from "./formatCurrency";

const Order = () => {

    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // REVIEW STATES
    // ==========================================

    const [reviewOrder, setReviewOrder] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewMessage, setReviewMessage] = useState("");
    const [reviewError, setReviewError] = useState("");

    const customerId = localStorage.getItem("userId");


    // ==========================================
    // GET CUSTOMER ORDERS
    // ==========================================

    const getOrders = async () => {

        try {

            if (!customerId) {
                setError("Please login first.");
                setLoading(false);
                return;
            }

            const response = await api.get(
                `/orders/customer/${customerId}`
            );

            console.log("Orders:", response.data);

            setOrders(response.data.orders || []);

            setLoading(false);

        } catch (error) {

            console.log("Get orders error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load orders."
            );

            setLoading(false);
        }
    };


    useEffect(() => {

        getOrders();

    }, []);


    // ==========================================
    // OPEN REVIEW FORM
    // ==========================================

    const openReview = (order) => {

        setReviewOrder(order);

        setRating(0);
        setComment("");

        setReviewMessage("");
        setReviewError("");
    };


    // ==========================================
    // CLOSE REVIEW FORM
    // ==========================================

    const closeReview = () => {

        setReviewOrder(null);

        setRating(0);
        setComment("");

        setReviewMessage("");
        setReviewError("");
    };


    // ==========================================
    // SUBMIT REVIEW
    // ==========================================

    const submitReview = async () => {

        if (!rating) {

            setReviewError(
                "Please select a rating."
            );

            return;
        }

        if (!comment.trim()) {

            setReviewError(
                "Please write a comment."
            );

            return;
        }

        try {

            setReviewLoading(true);
            setReviewError("");
            setReviewMessage("");

            const response = await api.post(
                "/review/add",
                {
                    customerId: customerId,
                    orderId: reviewOrder._id,
                    rating: rating,
                    comment: comment.trim()
                }
            );

            console.log(
                "Review response:",
                response.data
            );

            setReviewMessage(
                "Review submitted successfully! â­"
            );

            setReviewLoading(false);

            // Close review form after a short delay
            setTimeout(() => {

                closeReview();

            }, 1500);

        } catch (error) {

            console.log(
                "Submit review error:",
                error
            );

            setReviewError(
                error.response?.data?.message ||
                "Unable to submit review."
            );

            setReviewLoading(false);
        }
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className={styles.loading}>

                <h2>
                    Loading your orders... ðŸ“¦
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


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className={styles.container}>

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className={styles.header}>

                <div>

                    <h1>
                        My Orders ðŸ“¦
                    </h1>

                    <p>
                        View all your crop orders and their status.
                    </p>

                </div>

                <button
                    className={styles.backButton}
                    onClick={() =>
                        navigate("/customer-crops")
                    }
                >
                    â† Continue Shopping
                </button>

            </div>


            {/* ==========================================
                NO ORDERS
            ========================================== */}

            {orders.length === 0 ? (

                <div className={styles.noOrders}>

                    <div className={styles.emptyIcon}>
                        ðŸ“¦
                    </div>

                    <h2>
                        No Orders Yet
                    </h2>

                    <p>
                        You haven't placed any orders yet.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/customer-crops")
                        }
                    >
                        ðŸŒ¾ Browse Crops
                    </button>

                </div>

            ) : (

                <div className={styles.orderGrid}>

                    {orders.map((order) => (

                        <div
                            className={styles.orderCard}
                            key={order._id}
                        >

                            {/* ==========================================
                                ORDER HEADER
                            ========================================== */}

                            <div className={styles.orderHeader}>

                                <div>

                                    <h2>
                                        ðŸŒ¾ {order.cropName}
                                    </h2>

                                    <small>
                                        Order ID: {order._id}
                                    </small>

                                </div>

                                <span
                                    className={`${styles.status} ${
                                        styles[
                                            order.orderStatus?.toLowerCase()
                                        ]
                                    }`}
                                >
                                    {order.orderStatus}
                                </span>

                            </div>


                            {/* ==========================================
                                ORDER DETAILS
                            ========================================== */}

                            <div className={styles.details}>

                                <div className={styles.detailRow}>

                                    <span>
                                        ðŸ“¦ Quantity
                                    </span>

                                    <strong>
                                        {order.quantity} {order.unit}
                                    </strong>

                                </div>


                                <div className={styles.detailRow}>

                                    <span>
                                        ðŸ’° Price
                                    </span>

                                    <strong>
                                        {formatCurrency(order.price)} / {order.unit}
                                    </strong>

                                </div>


                                <div className={styles.detailRow}>

                                    <span>
                                        ðŸ’µ Total Amount
                                    </span>

                                    <strong>
                                        {formatCurrency(order.totalAmount)}
                                    </strong>

                                </div>


                                <div className={styles.detailRow}>

                                    <span>
                                        ðŸ’³ Payment
                                    </span>

                                    <strong>
                                        {order.paymentMethod}
                                    </strong>

                                </div>


                                <div className={styles.detailRow}>

                                    <span>
                                        ðŸ’³ Payment Status
                                    </span>

                                    <strong>
                                        {order.paymentStatus}
                                    </strong>

                                </div>


                                <div className={styles.address}>

                                    <strong>
                                        ðŸ“ Delivery Address
                                    </strong>

                                    <p>
                                        {order.address}
                                    </p>

                                </div>


                                <div className={styles.date}>

                                    Ordered on:{" "}

                                    {new Date(
                                        order.createdAt
                                    ).toLocaleString()}

                                </div>


                                {/* ==========================================
                                    WRITE REVIEW BUTTON
                                ========================================== */}

                                {order.orderStatus === "Delivered" && (

                                    <button
                                        className={styles.reviewButton}
                                        onClick={() =>
                                            openReview(order)
                                        }
                                    >
                                        â­ Write a Review
                                    </button>

                                )}

                            </div>

                        </div>

                    ))}

                </div>

            )}


            {/* ==========================================
                REVIEW MODAL
            ========================================== */}

            {reviewOrder && (

                <div className={styles.reviewOverlay}>

                    <div className={styles.reviewModal}>

                        {/* CLOSE BUTTON */}

                        <button
                            className={styles.closeReview}
                            onClick={closeReview}
                        >
                            Ã—
                        </button>


                        {/* TITLE */}

                        <div className={styles.reviewHeader}>

                            <div className={styles.reviewIcon}>
                                â­
                            </div>

                            <h2>
                                Write a Review
                            </h2>

                            <p>
                                How was your experience with{" "}
                                <strong>
                                    {reviewOrder.cropName}
                                </strong>
                                ?
                            </p>

                        </div>


                        {/* ==========================================
                            STAR RATING
                        ========================================== */}

                        <div className={styles.ratingSection}>

                            <label>
                                Your Rating
                            </label>

                            <div className={styles.stars}>

                                {[1, 2, 3, 4, 5].map(
                                    (star) => (

                                        <button
                                            key={star}
                                            type="button"
                                            className={
                                                star <= rating
                                                    ? styles.starActive
                                                    : styles.star
                                            }
                                            onClick={() =>
                                                setRating(star)
                                            }
                                        >
                                            â˜…
                                        </button>

                                    )
                                )}

                            </div>

                            {rating > 0 && (

                                <p className={styles.ratingText}>

                                    {rating === 1 &&
                                        "Very Poor ðŸ˜ž"}

                                    {rating === 2 &&
                                        "Poor ðŸ˜•"}

                                    {rating === 3 &&
                                        "Average ðŸ˜"}

                                    {rating === 4 &&
                                        "Good ðŸ˜Š"}

                                    {rating === 5 &&
                                        "Excellent ðŸ¤©"}

                                </p>

                            )}

                        </div>


                        {/* ==========================================
                            COMMENT
                        ========================================== */}

                        <div className={styles.commentSection}>

                            <label>
                                Your Review
                            </label>

                            <textarea
                                value={comment}
                                onChange={(e) =>
                                    setComment(e.target.value)
                                }
                                placeholder="Tell us about the crop quality, freshness and your experience..."
                                rows="5"
                                maxLength="500"
                            />

                            <div className={styles.characterCount}>
                                {comment.length}/500
                            </div>

                        </div>


                        {/* ==========================================
                            SUCCESS MESSAGE
                        ========================================== */}

                        {reviewMessage && (

                            <div
                                className={
                                    styles.reviewSuccess
                                }
                            >
                                {reviewMessage}
                            </div>

                        )}


                        {/* ==========================================
                            ERROR MESSAGE
                        ========================================== */}

                        {reviewError && (

                            <div
                                className={
                                    styles.reviewError
                                }
                            >
                                {reviewError}
                            </div>

                        )}


                        {/* ==========================================
                            BUTTONS
                        ========================================== */}

                        <div className={styles.reviewActions}>

                            <button
                                className={styles.cancelReview}
                                onClick={closeReview}
                                disabled={reviewLoading}
                            >
                                Cancel
                            </button>

                            <button
                                className={styles.submitReview}
                                onClick={submitReview}
                                disabled={reviewLoading}
                            >
                                {reviewLoading
                                    ? "Submitting..."
                                    : "Submit Review â­"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};


export default Order;