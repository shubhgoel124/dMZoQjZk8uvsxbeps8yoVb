import express from "express"
import { protectRoute } from "../middleware/auth.js"
import { getMessages, getUsersForSidebar, markMessageAsSeen, sendMessage, sendGlobalMessage, getGlobalMessages } from "../controllers/messageController.js"

var messageRouter = express.Router()

messageRouter.get("/users", protectRoute, getUsersForSidebar)
messageRouter.get("/global", protectRoute, getGlobalMessages)
messageRouter.get("/:id", protectRoute, getMessages)

messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen)

messageRouter.post("/send/global", protectRoute, sendGlobalMessage)
messageRouter.post("/send/:id", protectRoute, sendMessage)

export default messageRouter