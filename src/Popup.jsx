import React from "react";
import styles from "./Popup.module.css";

const Popup = ({ message, onClose }) => {
    if (!message) {
        return null;
    }

    return (
        <div className={styles.overlay}>

            <div className={styles.popup}>

                <div className={styles.icon}>
                    ✓
                </div>

                <h2>Success!</h2>

                <p>{message}</p>

                <button
                    className={styles.closeButton}
                    onClick={onClose}
                >
                    OK
                </button>

            </div>

        </div>
    );
};

export default Popup;