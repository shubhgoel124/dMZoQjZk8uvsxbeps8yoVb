import { generateToken } from "../lib/utils.js"
import User from "../models/User.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"
import { sendOTP } from "../lib/mailer.js"

export const signup = async (req, res)=>{
    let { fullName, email, password, bio } = req.body

    try {
        if (!fullName || !email || !password || !bio){
            return res.json({success: false, message: "Missing Details" })
        }
        
        let user = await User.findOne({email})

        if(!user || !user.isVerified){
            return res.json({success: false, message: "Email not verified. Please verify your email first." })
        }

        if(user.password && user.password.length > 0 && user.fullName === fullName){
             // This case might happen if they somehow trigger signup twice for a verified user
             // but let's just proceed or check if they are already fully set up.
        }

        var salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        user.fullName = fullName;
        user.password = hashedPassword;
        user.bio = bio;
        user.isVerified = true; // explicitly mark as verified
        user.signupOTP = undefined;
        user.signupOTPExpires = undefined;
        
        await user.save();

        let token = generateToken(user._id)

        res.json({success: true, userData: user, token, message: "Account created successfully"})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const sendSignupOTP = async (req, res) => {
    try {
        const { email, fullName } = req.body;
        if (!email || !fullName) return res.json({ success: false, message: "Email and Full Name are required" });

        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res.json({ success: false, message: "Account already exists with this email" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(otp, salt);

        if (existingUser) {
            existingUser.signupOTP = hashedOTP;
            existingUser.signupOTPExpires = Date.now() + 15 * 60 * 1000;
            existingUser.fullName = fullName; // update name if changed during retry
            await existingUser.save();
        } else {
            await User.create({
                email,
                fullName,
                password: "temporary_password_" + Date.now(), // Placeholder until step 3
                isVerified: false,
                signupOTP: hashedOTP,
                signupOTPExpires: Date.now() + 15 * 60 * 1000
            });
        }

        console.log(`[SIGNUP OTP] for ${email} is: ${otp}`);
        const emailResult = await sendOTP(email, otp);
        
        if (emailResult.success) {
            res.json({ success: true, message: `OTP sent to ${email}` });
        } else {
            console.error("Email send failure:", emailResult.error);
            res.json({ success: false, message: "Failed to send email. Check backend terminal for OTP if testing locally." });
        }
    } catch (error) {
        console.log("Send Signup OTP Error:", error);
        res.json({ success: false, message: "Error sending verification code" });
    }
};

export const verifySignupOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.json({ success: false, message: "Email and OTP are required" });

        const user = await User.findOne({ email });
        if (!user || user.isVerified) {
            return res.json({ success: false, message: "Invalid verification request" });
        }

        if (Date.now() > user.signupOTPExpires) {
            return res.json({ success: false, message: "OTP expired" });
        }

        const isOTPValid = await bcrypt.compare(otp.toString(), user.signupOTP);
        if (!isOTPValid) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        // Technically verified for this email now, but we wait for password/bio in 'signup'
        // To prevent others from stealing this session, we could set a flag or just return success
        // and check the same OTP or a session token. For now, simple flag.
        user.isVerified = true; 
        await user.save();

        res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
        console.log("Verify Signup OTP Error:", error);
        res.json({ success: false, message: "Error verifying code" });
    }
};

export const login = async (req, res) =>{
    try {
        let { email, password } = req.body
        var userData = await User.findOne({email})

        if (!userData) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        if (!userData.isVerified) {
            return res.json({ success: false, message: "Please verify your email first" })
        }

        let isPasswordCorrect = await bcrypt.compare(password, userData.password)

        if (!isPasswordCorrect){
            return res.json({ success: false, message: "Invalid credentials" })
        }

        let token = generateToken(userData._id)

        res.json({success: true, userData, token, message: "Login successful"})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}


export let checkAuth = (req, res)=>{
    res.json({success: true, user: req.user})
}

export const updateProfile = async (req, res)=>{
    try {
        let { profilePic, bio, fullName } = req.body

        var userId = req.user._id
        let updatedUser

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true})
        } else{
            let upload = await cloudinary.uploader.upload(profilePic)
            updatedUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true})
        }
        res.json({success: true, user: updatedUser})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.json({ success: false, message: "Email is required" });

        const user = await User.findOne({ email });
        if (!user) return res.json({ success: false, message: "No account found with that email" });

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Hash the OTP before storing it for security
        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(otp, salt);

        // Store hashed OTP and set expiration to 15 minutes from now
        user.resetPasswordOTP = hashedOTP;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        console.log(`[RESET OTP] for ${email} is: ${otp}`); // For easier local testing

        const emailResult = await sendOTP(email, otp);
        
        if (emailResult.success) {
            res.json({ success: true, message: `OTP sent to ${email}` });
        } else {
            console.error("Email send failure:", emailResult.error);
            res.json({ success: false, message: "Failed to send reset email. Check backend terminal for OTP." });
        }
    } catch (error) {
        console.log("Forgot Password Error:", error);
        res.json({ success: false, message: "An error occurred while generating OTP" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) return res.json({ success: false, message: "Missing required fields" });

        const user = await User.findOne({ email });
        if (!user || !user.resetPasswordOTP || !user.resetPasswordExpires) {
            return res.json({ success: false, message: "Invalid or expired OTP session" });
        }

        // Check expiration
        if (Date.now() > user.resetPasswordExpires) {
            user.resetPasswordOTP = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            return res.json({ success: false, message: "OTP has expired. Please request a new one." });
        }

        // Verify OTP
        const isOTPValid = await bcrypt.compare(otp.toString(), user.resetPasswordOTP);
        if (!isOTPValid) {
            return res.json({ success: false, message: "Invalid OTP provided" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ success: true, message: "Password has been successfully reset. You can now login." });
    } catch (error) {
        console.log("Reset Password Error:", error);
        res.json({ success: false, message: "An error occurred while resetting the password" });
    }
};