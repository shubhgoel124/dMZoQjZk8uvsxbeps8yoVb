import mongoose from "mongoose"

var userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    fullName: {type: String, required: true},
    password: {type: String, required: true, minlength: 6},
    profilePic: {type: String, default: ""},
    bio: {type: String},
    lastSeen: {type: Date},
    resetPasswordOTP: {type: String},
    resetPasswordExpires: {type: Date},
    signupOTP: {type: String},
    signupOTPExpires: {type: Date},
    isVerified: {type: Boolean, default: false},
}, {timestamps: true})

let User = mongoose.model("User", userSchema)

export default User