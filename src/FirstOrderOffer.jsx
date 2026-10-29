import React from "react";
import styles from "./FirstOrderOffer.module.css";

const FirstOrderOffer = () => (
    <aside className={styles.banner} aria-label="First-order offer information">
        <span className={styles.icon} aria-hidden="true">🌱</span>
        <div>
            <h2>First-order offer</h2>
            <p>
                Eligible customers may receive 10% off crop subtotals of
                {" "}₹500.00 or more.
            </p>
            <p className={styles.note}>
                Eligibility and any savings must be confirmed by the order service.
            </p>
        </div>
    </aside>
);

export default FirstOrderOffer;
