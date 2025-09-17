const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Helper function to generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

// ---------------- OTP Endpoint ----------------
app.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });

    const otp = generateOTP();

    // Nodemailer transporter using Gmail or SMTP2GO
    const transporter = nodemailer.createTransport({
        service: 'gmail',  // or 'SMTP2GO'
        auth: {
            user: process.env.SMTP_USER, // set via environment variable
            pass: process.env.SMTP_PASS, // set via environment variable
        },
    });

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP is: ${otp}`,
        html: `<b>Your OTP is:</b> ${otp}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP successfully sent to ${email}`);
        res.json({ success: true, otp }); // include OTP for testing
    } catch (error) {
        console.error(`Error sending OTP: ${error}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ---------------- Coupon Endpoint ----------------
app.post('/send-coupon', async (req, res) => {
    const { email, couponCode } = req.body;
    if (!email || !couponCode) return res.status(400).json({ success: false, error: "Email and couponCode are required" });
    if (couponCode.includes(".")) return res.status(400).json({ success: false, error: "Invalid coupon code (decimal found)" });

    const transporter = nodemailer.createTransport({
        service: 'gmail', // or 'SMTP2GO'
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Your GIVEAWAY CODE',
        text: `Your GIVEAWAY CODE is: ${couponCode}`,
        html: `<h2>Slouch Giveaway</h2><p>Your GIVEAWAY CODE is: <b>${couponCode}</b></p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Coupon code ${couponCode} sent to ${email}`);
        res.json({ success: true });
    } catch (error) {
        console.error(`Error sending coupon: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Email service running on port ${PORT}`);
});
