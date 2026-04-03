import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://shubhgoel:shubhgoel@cluster0.qu5ltmu.mongodb.net/chat-app";

const userSchema = new mongoose.Schema({
    email: String,
    fullName: String,
    lastSeen: Date,
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

async function run() {
    await mongoose.connect(MONGODB_URI);
    const users = await User.find({}).lean();
    console.log(users.map(u => ({fullName: u.fullName, email: u.email})));
    process.exit(0);
}

run().catch(console.dir);
