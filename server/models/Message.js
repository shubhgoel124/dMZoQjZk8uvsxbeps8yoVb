import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    senderId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    receiverId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: function() { return !this.isGlobal }},
    text: { type: String },
    image: { type: String },
    seen: {type: Boolean, default: false},
    isGlobal: {type: Boolean, default: false}
}, {timestamps: true})

let Message = mongoose.model("Message", messageSchema)
export default Message