import Message from "../models/Message.js"
import User from "../models/User.js"
import cloudinary from "../lib/cloudinary.js"
import { io, userSocketMap } from "../server.js"

export const getUsersForSidebar = async (req, res)=>{
    try {
        let userId = req.user._id
        const filteredUsers = await User.find({_id: {$ne: userId}}).select("-password")

        var unseenMessages = {}
        let promises = filteredUsers.map(async (user)=>{
            let messages = await Message.find({senderId: user._id, receiverId: userId, seen: false})
            if(messages.length > 0){
                unseenMessages[user._id] = messages.length
            }
        })
        await Promise.all(promises)
        res.json({success: true, users: filteredUsers, unseenMessages})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const getMessages = async (req, res) =>{
    try {
        let { id: selectedUserId } = req.params
        var myId = req.user._id

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId},
            ]
        })
        await Message.updateMany({senderId: selectedUserId, receiverId: myId}, {seen: true})

        res.json({success: true, messages})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export let markMessageAsSeen = async (req, res)=>{
    try {
        const { id } = req.params
        await Message.findByIdAndUpdate(id, {seen: true})
        res.json({success: true})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const sendMessage = async (req, res) =>{
    try {
        let {text, image} = req.body
        const receiverId = req.params.id
        var senderId = req.user._id

        let imageUrl
        if(image){
            let uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        let receiverSocketId = userSocketMap[receiverId]
        if (receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res.json({success: true, newMessage})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const sendGlobalMessage = async (req, res) => {
    try {
        let { text, image } = req.body
        var senderId = req.user._id

        let imageUrl
        if (image) {
            let uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }

        const newMessage = await Message.create({
            senderId,
            text,
            image: imageUrl,
            isGlobal: true
        })

        io.to("globalRoom").emit("newGlobalMessage", newMessage)

        res.json({ success: true, newMessage })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export let getGlobalMessages = async (req, res) => {
    try {
        const messages = await Message.find({ isGlobal: true }).sort({ createdAt: 1 }).limit(50)
        res.json({ success: true, messages })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}