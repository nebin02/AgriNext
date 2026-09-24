const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendOTPEmail = async (email, otp) => {

    const mailOptions = {
        from: `"AgriNext" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: "AgriNext Email Verification OTP",

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 500px;
                margin: auto;
                padding: 30px;
                border: 1px solid #ddd;
                border-radius: 12px;
                background-color: #ffffff;
            ">

                <h2 style="color: #2e7d32;">
                    🌱 AgriNext
                </h2>

                <h3>Email Verification</h3>

                <p>
                    Your AgriNext verification OTP is:
                </p>

                <div style="
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    color: #2e7d32;
                    padding: 15px;
                    text-align: center;
                    background-color: #f1f8e9;
                    border-radius: 8px;
                ">
                    ${otp}
                </div>

                <p>
                    This OTP is valid for <strong>5 minutes</strong>.
                </p>

                <p>
                    If you did not request this OTP, you can safely ignore
                    this email.
                </p>

                <hr>

                <p style="font-size: 12px; color: #777;">
                    © 2026 AgriNext. Smart Farming • Better Future 🌿
                </p>

            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendOTPEmail;