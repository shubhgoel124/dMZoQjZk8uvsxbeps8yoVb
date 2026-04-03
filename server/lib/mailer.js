import nodemailer from 'nodemailer';
import 'dotenv/config';

// Configure the nodemailer transport using environment variables
export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendOTP = async (toEmail, otpCode) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: 'QuickChat - Password Reset OTP',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                    <h2>Password Reset Request</h2>
                    <p>We received a request to reset your password for your QuickChat account.</p>
                    <p>Your One-Time Password (OTP) is:</p>
                    <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${otpCode}</h1>
                    <p>This code will expire in 15 minutes.</p>
                    <p>If you did not request a password reset, please safely ignore this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP Email sent: ' + info.response);
        return { success: true };
    } catch (error) {
        console.log('Error sending OTP email:', error);
        return { success: false, error: error.message };
    }
};
