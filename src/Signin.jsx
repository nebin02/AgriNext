import React, { useState } from "react";
import api from "./api";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Signin.module.css";

const Signin = () => {

    const navigate = useNavigate();

    // ===============================
    // USER TYPE
    // ===============================

    const [userType, setUserType] = useState("customer");

    // ===============================
    // SIGN IN FIELDS
    // ===============================

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // ===============================
    // PASSWORD SHOW / HIDE
    // ===============================

    const [showPassword, setShowPassword] = useState(false);

    // ===============================
    // FORGOT PASSWORD
    // ===============================

    const [forgotMode, setForgotMode] = useState(false);

    const [forgotStep, setForgotStep] = useState("email");

    const [forgotEmail, setForgotEmail] = useState("");

    const [forgotOtp, setForgotOtp] = useState("");

    const [newPassword, setNewPassword] = useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showNewPassword, setShowNewPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    // ===============================
    // RESEND OTP
    // ===============================

    const [resendLoading, setResendLoading] =
        useState(false);

    const [resendTimer, setResendTimer] =
        useState(0);

    // ===============================
    // MESSAGE / LOADING
    // ===============================

    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(false);


    // =====================================================
    // SIGN IN
    // =====================================================

    const handleSignin = async (e) => {

        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {

            const response = await api.post(
                "/signin",
                {
                    email: email,
                    password: password,
                    userType: userType
                }
            );

            console.log(
                "Login response:",
                response.data
            );


            // Save user information

            localStorage.setItem(
                "userId",
                response.data.userId
            );

            localStorage.setItem(
                "userType",
                response.data.userType
            );


            setMessage("Login successful!");


            // Redirect

            setTimeout(() => {

                if (
                    response.data.userType ===
                    "farmer"
                ) {

                    navigate(
                        "/farmer-dashboard"
                    );

                } else {

                    navigate(
                        "/customer-crops"
                    );

                }

            }, 800);


        } catch (error) {

            console.log(
                "Signin error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Login failed. Please check your email and password."
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // FORGOT PASSWORD - SEND OTP
    // =====================================================

    const handleForgotPassword = async (e) => {

        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {

            const response = await api.post(
                "/forgot-password",
                {
                    email: forgotEmail,
                    userType: userType
                }
            );

            console.log(
                "Forgot password response:",
                response.data
            );


            setMessage(
                "OTP sent successfully to your email."
            );

            // Clear old OTP
            setForgotOtp("");

            // Reset resend timer
            setResendTimer(0);

            setForgotStep("otp");


        } catch (error) {

            console.log(
                "Forgot password error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Unable to send OTP."
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // RESEND FORGOT PASSWORD OTP
    // =====================================================

    const handleResendForgotOTP = async () => {

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

            const response = await api.post(
                "/forgot-password",
                {
                    email: forgotEmail,
                    userType: userType
                }
            );

            console.log(
                "Resend forgot password OTP:",
                response.data
            );

            // Clear previous OTP
            setForgotOtp("");

            setMessage(
                "New OTP sent successfully! ðŸ“§"
            );

            // Start 60 second countdown
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
                "Resend forgot OTP error:",
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


    // =====================================================
    // VERIFY FORGOT PASSWORD OTP
    // =====================================================

    const handleVerifyForgotOTP = async (e) => {

        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {

            const response = await api.post(
                "/verify-forgot-password-otp",
                {
                    email: forgotEmail,
                    otp: forgotOtp,
                    userType: userType
                }
            );

            console.log(
                "OTP verification:",
                response.data
            );


            setMessage(
                "OTP verified successfully."
            );

            // Stop/reset resend timer
            setResendTimer(0);

            setForgotStep("password");


        } catch (error) {

            console.log(
                "OTP verification error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Invalid OTP."
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // RESET PASSWORD
    // =====================================================

    const handleResetPassword = async (e) => {

        e.preventDefault();

        setMessage("");


        // Check passwords

        if (
            newPassword !==
            confirmPassword
        ) {

            setMessage(
                "Passwords do not match."
            );

            return;
        }


        if (newPassword.length < 6) {

            setMessage(
                "Password must be at least 6 characters."
            );

            return;
        }


        setLoading(true);

        try {

            const response = await api.post(
                "/reset-password",
                {
                    email: forgotEmail,
                    otp: forgotOtp,
                    userType: userType,
                    newPassword: newPassword
                }
            );

            console.log(
                "Reset password response:",
                response.data
            );


            setMessage(
                "Password reset successfully! ðŸŽ‰"
            );


            // Clear fields

            setForgotEmail("");
            setForgotOtp("");
            setNewPassword("");
            setConfirmPassword("");

            setResendTimer(0);


            // Go back to login

            setTimeout(() => {

                setForgotMode(false);

                setForgotStep("email");

                setMessage("");

            }, 1800);


        } catch (error) {

            console.log(
                "Reset password error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to reset password."
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // BACK TO SIGN IN
    // =====================================================

    const handleBackToSignin = () => {

        setForgotMode(false);

        setForgotStep("email");

        setForgotEmail("");

        setForgotOtp("");

        setNewPassword("");

        setConfirmPassword("");

        setResendTimer(0);

        setMessage("");

    };


    // =====================================================
    // FORGOT PASSWORD SCREEN
    // =====================================================

    if (forgotMode) {

        return (

            <div className={styles.page}>

                <div className={styles.card}>

                    {/* HEADER */}

                    <div className={styles.header}>

                        <div className={styles.logo}>
                            ðŸ”
                        </div>

                        <h1>
                            AgriNext
                        </h1>

                        <p>
                            Reset your password
                        </p>

                    </div>


                    {/* =================================
                        STEP 1 - EMAIL
                    ================================= */}

                    {forgotStep === "email" && (

                        <>
                            <h2>
                                Forgot Password
                            </h2>

                            <p
                                style={{
                                    textAlign: "center",
                                    color: "rgba(255,255,255,.65)",
                                    marginBottom: "20px"
                                }}
                            >
                                Enter your registered email.
                                We will send you an OTP.
                            </p>


                            <form
                                className={styles.form}
                                onSubmit={
                                    handleForgotPassword
                                }
                            >

                                <div
                                    className={
                                        styles.inputGroup
                                    }
                                >

                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={forgotEmail}
                                        onChange={(e) =>
                                            setForgotEmail(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>


                                <button
                                    type="submit"
                                    className={
                                        styles.signinButton
                                    }
                                    disabled={loading}
                                >

                                    {loading
                                        ? "Sending OTP..."
                                        : "Send OTP"}

                                </button>

                            </form>
                        </>
                    )}


                    {/* =================================
                        STEP 2 - OTP
                    ================================= */}

                    {forgotStep === "otp" && (

                        <>
                            <h2>
                                Verify OTP
                            </h2>

                            <p
                                style={{
                                    textAlign: "center",
                                    color: "rgba(255,255,255,.65)",
                                    marginBottom: "20px"
                                }}
                            >
                                Enter the 6-digit OTP sent to
                                <br />
                                <strong>
                                    {forgotEmail}
                                </strong>
                            </p>


                            <form
                                className={styles.form}
                                onSubmit={
                                    handleVerifyForgotOTP
                                }
                            >

                                <div
                                    className={
                                        styles.inputGroup
                                    }
                                >

                                    <label>
                                        OTP
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        value={forgotOtp}
                                        maxLength={6}
                                        inputMode="numeric"
                                        onChange={(e) => {

                                            const value =
                                                e.target.value
                                                    .replace(
                                                        /\D/g,
                                                        ""
                                                    )
                                                    .slice(
                                                        0,
                                                        6
                                                    );

                                            setForgotOtp(
                                                value
                                            );

                                        }}
                                        required
                                    />

                                </div>


                                {/* VERIFY BUTTON */}

                                <button
                                    type="submit"
                                    className={
                                        styles.signinButton
                                    }
                                    disabled={
                                        loading ||
                                        forgotOtp.length !== 6
                                    }
                                >

                                    {loading
                                        ? "Verifying..."
                                        : "Verify OTP"}

                                </button>


                                {/* =================================
                                    RESEND OTP
                                ================================= */}

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
                                        onClick={
                                            handleResendForgotOTP
                                        }
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
                                                resendLoading ||
                                                loading
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

                            </form>
                        </>
                    )}


                    {/* =================================
                        STEP 3 - NEW PASSWORD
                    ================================= */}

                    {forgotStep === "password" && (

                        <>
                            <h2>
                                Create New Password
                            </h2>

                            <p
                                style={{
                                    textAlign: "center",
                                    color: "rgba(255,255,255,.65)",
                                    marginBottom: "20px"
                                }}
                            >
                                Enter your new password.
                            </p>


                            <form
                                className={styles.form}
                                onSubmit={
                                    handleResetPassword
                                }
                            >

                                {/* NEW PASSWORD */}

                                <div
                                    className={
                                        styles.inputGroup
                                    }
                                >

                                    <label>
                                        New Password
                                    </label>

                                    <div
                                        className={
                                            styles.passwordContainer
                                        }
                                    >

                                        <input
                                            type={
                                                showNewPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Enter new password"
                                            value={
                                                newPassword
                                            }
                                            onChange={(e) =>
                                                setNewPassword(
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />

                                        <button
                                            type="button"
                                            className={
                                                styles.passwordToggle
                                            }
                                            onClick={() =>
                                                setShowNewPassword(
                                                    !showNewPassword
                                                )
                                            }
                                        >
                                            {showNewPassword
                                                ? "ðŸ™ˆ"
                                                : "ðŸ‘ï¸"}
                                        </button>

                                    </div>

                                </div>


                                {/* CONFIRM PASSWORD */}

                                <div
                                    className={
                                        styles.inputGroup
                                    }
                                >

                                    <label>
                                        Confirm Password
                                    </label>

                                    <div
                                        className={
                                            styles.passwordContainer
                                        }
                                    >

                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Confirm new password"
                                            value={
                                                confirmPassword
                                            }
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />

                                        <button
                                            type="button"
                                            className={
                                                styles.passwordToggle
                                            }
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                        >
                                            {showConfirmPassword
                                                ? "ðŸ™ˆ"
                                                : "ðŸ‘ï¸"}
                                        </button>

                                    </div>

                                </div>


                                <button
                                    type="submit"
                                    className={
                                        styles.signinButton
                                    }
                                    disabled={loading}
                                >

                                    {loading
                                        ? "Updating Password..."
                                        : "Reset Password"}

                                </button>

                            </form>
                        </>
                    )}


                    {/* MESSAGE */}

                    {message && (

                        <p className={styles.message}>
                            {message}
                        </p>

                    )}


                    {/* BACK TO SIGN IN */}

                    <button
                        type="button"
                        onClick={
                            handleBackToSignin
                        }
                        style={{
                            display: "block",
                            width: "100%",
                            marginTop: "20px",
                            padding: "12px",
                            color: "#c2d883",
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,.2)",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        â† Back to Sign In
                    </button>

                </div>

            </div>

        );
    }


    // =====================================================
    // NORMAL SIGN IN SCREEN
    // =====================================================

    return (

        <div className={styles.page}>

            <div className={styles.card}>

                {/* HEADER */}

                <div className={styles.header}>

                    <div className={styles.logo}>
                        ðŸŒ±
                    </div>

                    <h1>
                        Welcome to AgriNext
                    </h1>

                    <p>
                        Sign in to your account
                    </p>

                </div>


                {/* USER TYPE */}

                <div className={styles.userType}>

                    <button
                        type="button"
                        className={
                            userType === "customer"
                                ? styles.activeType
                                : styles.typeButton
                        }
                        onClick={() =>
                            setUserType("customer")
                        }
                    >
                        ðŸ‘¤ Customer
                    </button>


                    <button
                        type="button"
                        className={
                            userType === "farmer"
                                ? styles.activeType
                                : styles.typeButton
                        }
                        onClick={() =>
                            setUserType("farmer")
                        }
                    >
                        ðŸŒ¾ Farmer
                    </button>

                </div>


                {/* HEADING */}

                <h2>

                    {userType === "farmer"
                        ? "Farmer Sign In"
                        : "Customer Sign In"}

                </h2>


                {/* SIGN IN FORM */}

                <form
                    className={styles.form}
                    onSubmit={handleSignin}
                >

                    {/* EMAIL */}

                    <div
                        className={
                            styles.inputGroup
                        }
                    >

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                            required
                        />

                    </div>


                    {/* PASSWORD */}

                    <div
                        className={
                            styles.inputGroup
                        }
                    >

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
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                required
                            />

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


                    {/* FORGOT PASSWORD */}

                    <div
                        style={{
                            textAlign: "right",
                            marginTop: "-5px",
                            marginBottom: "5px"
                        }}
                    >

                        <button
                            type="button"
                            onClick={() => {

                                setForgotEmail(email);

                                setForgotMode(true);

                                setForgotStep("email");

                                setMessage("");

                            }}
                            style={{
                                border: "none",
                                background: "transparent",
                                color: "#c2d883",
                                cursor: "pointer",
                                fontWeight: "700",
                                fontSize: "0.82rem"
                            }}
                        >
                            Forgot Password?
                        </button>

                    </div>


                    {/* SIGN IN BUTTON */}

                    <button
                        type="submit"
                        className={
                            styles.signinButton
                        }
                        disabled={loading}
                    >

                        {loading
                            ? "Signing In..."
                            : "Sign In"}

                    </button>

                </form>


                {/* MESSAGE */}

                {message && (

                    <p className={styles.message}>
                        {message}
                    </p>

                )}


                {/* SIGN UP */}

                <div
                    className={
                        styles.signupText
                    }
                >

                    Don't have an account?

                    {" "}

                    <Link to="/signup">
                        Sign Up
                    </Link>

                </div>


                {/* HOME */}

                <Link
                    to="/"
                    className={
                        styles.homeLink
                    }
                >
                    â† Back to Home
                </Link>

            </div>

        </div>

    );

};

export default Signin;