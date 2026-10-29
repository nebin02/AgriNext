import React, { useState } from "react";
import api from "./api";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Signup.module.css";

const Signup = () => {

    const navigate = useNavigate();

    // ==========================================
    // USER TYPE
    // ==========================================

    const [userType, setUserType] = useState("customer");

    // ==========================================
    // FORM DATA
    // ==========================================

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        address: "",
        farmLocation: ""
    });

    // ==========================================
    // PASSWORD SHOW / HIDE
    // ==========================================

    const [showPassword, setShowPassword] = useState(false);

    // ==========================================
    // OTP
    // ==========================================

    const [otp, setOtp] = useState("");

    // ==========================================
    // PAGE STEP
    //
    // signup = signup form
    // otp    = OTP verification page
    // ==========================================

    const [step, setStep] = useState("signup");

    // ==========================================
    // MESSAGE
    // ==========================================

    const [message, setMessage] = useState("");

    // ==========================================
    // LOADING
    // ==========================================

    const [loading, setLoading] = useState(false);

    // ==========================================
    // RESEND OTP
    // ==========================================

    const [resendLoading, setResendLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    // ==========================================
    // HANDLE INPUT
    // ==========================================

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    // ==========================================
    // HANDLE SEND OTP
    // ==========================================

    const handleSignup = async (e) => {

        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {

            // --------------------------------------
            // DATA FOR BACKEND
            // --------------------------------------

            const data = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                address: formData.address,
                userType: userType
            };

            // Farmer needs farm location
            if (userType === "farmer") {

                data.farmLocation =
                    formData.farmLocation;

            }

            // --------------------------------------
            // SEND OTP
            // --------------------------------------

            const response = await api.post(
                "/send-otp",
                data
            );

            console.log(
                "OTP response:",
                response.data
            );

            // --------------------------------------
            // SUCCESS
            // --------------------------------------

            setMessage(
                "OTP sent successfully to your email"
            );

            // Clear old OTP
            setOtp("");

            // Reset resend timer
            setResendTimer(0);

            // Go to OTP page
            setStep("otp");

        } catch (error) {

            console.log(
                "Send OTP error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to send OTP. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };

    // ==========================================
    // HANDLE RESEND OTP
    // ==========================================

    const handleResendOTP = async () => {

        // Prevent multiple clicks
        if (
            resendTimer > 0 ||
            resendLoading
        ) {
            return;
        }

        setMessage("");
        setResendLoading(true);

        try {

            // --------------------------------------
            // DATA FOR BACKEND
            // --------------------------------------

            const data = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                address: formData.address,
                userType: userType
            };

            // Farmer needs farm location
            if (userType === "farmer") {

                data.farmLocation =
                    formData.farmLocation;

            }

            // --------------------------------------
            // SEND NEW OTP
            // --------------------------------------

            const response = await api.post(
                "/send-otp",
                data
            );

            console.log(
                "Resend OTP response:",
                response.data
            );

            // Clear previous OTP
            setOtp("");

            setMessage(
                "New OTP sent successfully! ðŸ“§"
            );

            // --------------------------------------
            // START 60 SECOND TIMER
            // --------------------------------------

            setResendTimer(60);

            const timer = setInterval(() => {

                setResendTimer((previous) => {

                    if (previous <= 1) {

                        clearInterval(timer);

                        return 0;
                    }

                    return previous - 1;

                });

            }, 1000);

        } catch (error) {

            console.log(
                "Resend OTP error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to resend OTP. Please try again."
            );

        } finally {

            setResendLoading(false);

        }

    };

    // ==========================================
    // HANDLE OTP VERIFICATION
    // ==========================================

    const handleVerifyOTP = async (e) => {

        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {

            // --------------------------------------
            // VERIFY OTP
            // --------------------------------------

            const response = await api.post(
                "/verify-otp",
                {
                    email: formData.email,
                    otp: otp,
                    userType: userType
                }
            );

            console.log(
                "Verify OTP response:",
                response.data
            );

            // --------------------------------------
            // SUCCESS MESSAGE
            // --------------------------------------

            setMessage(
                "Email verified! Account created successfully ðŸŽ‰"
            );

            // --------------------------------------
            // CLEAR DATA
            // --------------------------------------

            setFormData({
                name: "",
                email: "",
                phone: "",
                password: "",
                address: "",
                farmLocation: ""
            });

            setOtp("");
            setShowPassword(false);
            setResendTimer(0);

            // --------------------------------------
            // GO TO SIGNIN
            // --------------------------------------

            setTimeout(() => {

                navigate("/signin");

            }, 1800);

        } catch (error) {

            console.log(
                "Verify OTP error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "OTP verification failed. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };

    // ==========================================
    // GO BACK TO SIGNUP
    // ==========================================

    const handleBackToSignup = () => {

        setStep("signup");
        setOtp("");
        setMessage("");
        setResendTimer(0);

    };

    // ==========================================
    // OTP PAGE
    // ==========================================

    if (step === "otp") {

        return (

            <div className={styles.page}>

                <div className={styles.card}>

                    {/* ================= HEADER ================= */}

                    <div className={styles.header}>

                        <h1>
                            AgriNext ðŸŒ±
                        </h1>

                        <p>
                            Verify your email
                        </p>

                    </div>


                    {/* ================= OTP TITLE ================= */}

                    <h2>
                        Email Verification
                    </h2>


                    {/* ================= OTP DESCRIPTION ================= */}

                    <div
                        style={{
                            textAlign: "center",
                            marginBottom: "20px"
                        }}
                    >

                        <p>
                            We have sent a 6-digit OTP to
                        </p>

                        <strong>
                            {formData.email}
                        </strong>

                        <p
                            style={{
                                marginTop: "10px"
                            }}
                        >
                            Please enter the OTP to activate
                            your account.
                        </p>

                    </div>


                    {/* ================= OTP FORM ================= */}

                    <form
                        className={styles.form}
                        onSubmit={handleVerifyOTP}
                    >

                        <div className={styles.inputGroup}>

                            <label>
                                Enter OTP
                            </label>

                            <input
                                type="text"
                                name="otp"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => {

                                    const value =
                                        e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 6);

                                    setOtp(value);

                                }}
                                maxLength={6}
                                inputMode="numeric"
                                required
                            />

                        </div>


                        {/* ================= VERIFY BUTTON ================= */}

                        <button
                            type="submit"
                            className={styles.signupButton}
                            disabled={
                                loading ||
                                otp.length !== 6
                            }
                        >

                            {loading
                                ? "Verifying..."
                                : "Verify OTP"}

                        </button>


                        {/* ================= RESEND OTP ================= */}

                        <div
                            style={{
                                textAlign: "center",
                                marginTop: "18px"
                            }}
                        >

                            <p
                                style={{
                                    color:
                                        "rgba(255,255,255,.6)",
                                    fontSize: "0.85rem",
                                    marginBottom: "8px"
                                }}
                            >
                                Didn't receive the OTP?
                            </p>

                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={
                                    resendTimer > 0 ||
                                    resendLoading ||
                                    loading
                                }
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    color:
                                        resendTimer > 0 ||
                                        resendLoading
                                            ? "rgba(255,255,255,.4)"
                                            : "#c2d883",
                                    cursor:
                                        resendTimer > 0 ||
                                        resendLoading ||
                                        loading
                                            ? "not-allowed"
                                            : "pointer",
                                    fontWeight: "700",
                                    fontSize: "0.85rem"
                                }}
                            >

                                {resendLoading
                                    ? "Sending OTP..."
                                    : resendTimer > 0
                                    ? `Resend OTP in ${resendTimer}s`
                                    : "Resend OTP"}

                            </button>

                        </div>


                        {/* ================= BACK BUTTON ================= */}

                        <button
                            type="button"
                            onClick={handleBackToSignup}
                            disabled={loading}
                            style={{
                                width: "100%",
                                marginTop: "12px",
                                padding: "12px",
                                borderRadius: "8px",
                                cursor: loading
                                    ? "not-allowed"
                                    : "pointer",
                                background: "transparent",
                                border: "1px solid #aaa",
                                color: "#fff"
                            }}
                        >

                            â† Back to Signup

                        </button>

                    </form>


                    {/* ================= MESSAGE ================= */}

                    {message && (

                        <p className={styles.message}>
                            {message}
                        </p>

                    )}

                </div>

            </div>

        );

    }


    // ==========================================
    // SIGNUP PAGE
    // ==========================================

    return (

        <div className={styles.page}>

            <div className={styles.card}>

                {/* ================= HEADER ================= */}

                <div className={styles.header}>

                    <h1>
                        AgriNext ðŸŒ±
                    </h1>

                    <p>
                        Create your account
                    </p>

                </div>


                {/* ================= USER TYPE ================= */}

                <div className={styles.userType}>

                    {/* Customer */}

                    <button
                        type="button"
                        className={
                            userType === "customer"
                                ? styles.activeType
                                : styles.typeButton
                        }
                        onClick={() => {
                            setUserType("customer");
                            setMessage("");
                        }}
                    >

                        ðŸ‘¤ Customer

                    </button>


                    {/* Farmer */}

                    <button
                        type="button"
                        className={
                            userType === "farmer"
                                ? styles.activeType
                                : styles.typeButton
                        }
                        onClick={() => {
                            setUserType("farmer");
                            setMessage("");
                        }}
                    >

                        ðŸŒ¾ Farmer

                    </button>

                </div>


                {/* ================= TITLE ================= */}

                <h2>

                    {userType === "farmer"
                        ? "Farmer Registration"
                        : "Customer Registration"}

                </h2>


                {/* ================= FORM ================= */}

                <form
                    className={styles.form}
                    onSubmit={handleSignup}
                >

                    {/* ================= NAME ================= */}

                    <div className={styles.inputGroup}>

                        <label>
                            Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* ================= EMAIL ================= */}

                    <div className={styles.inputGroup}>

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* ================= PHONE ================= */}

                    <div className={styles.inputGroup}>

                        <label>
                            Phone
                        </label>

                        <input
                            type="tel"
                            name="phone"
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* ================= PASSWORD ================= */}

                    <div className={styles.inputGroup}>

                        <label>
                            Password
                        </label>

                        <div
                            className={
                                styles.passwordContainer
                            }
                        >

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />


                            {/* Show / Hide Password */}

                            <button
                                type="button"
                                className={
                                    styles.passwordToggle
                                }
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >

                                {showPassword
                                    ? "ðŸ™ˆ"
                                    : "ðŸ‘ï¸"}

                            </button>

                        </div>

                    </div>


                    {/* ================= ADDRESS ================= */}

                    <div className={styles.inputGroup}>

                        <label>
                            Address
                        </label>

                        <textarea
                            name="address"
                            placeholder="Enter your address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* ================= FARM LOCATION ================= */}

                    {userType === "farmer" && (

                        <div
                            className={
                                styles.inputGroup
                            }
                        >

                            <label>
                                Farm Location
                            </label>

                            <input
                                type="text"
                                name="farmLocation"
                                placeholder="Enter your farm location"
                                value={
                                    formData.farmLocation
                                }
                                onChange={handleChange}
                                required
                            />

                        </div>

                    )}


                    {/* ================= CREATE ACCOUNT ================= */}

                    <button
                        type="submit"
                        className={styles.signupButton}
                        disabled={loading}
                    >

                        {loading
                            ? "Sending OTP..."
                            : "Create Account"}

                    </button>

                </form>


                {/* ================= MESSAGE ================= */}

                {message && (

                    <p className={styles.message}>
                        {message}
                    </p>

                )}


                {/* ================= SIGN IN ================= */}

                <div className={styles.loginText}>

                    Already have an account?{" "}

                    <Link to="/signin">
                        Sign In
                    </Link>

                </div>


                {/* ================= HOME ================= */}

                <Link
                    to="/"
                    className={styles.homeLink}
                >

                    â† Back to Home

                </Link>

            </div>

        </div>

    );

};

export default Signup;