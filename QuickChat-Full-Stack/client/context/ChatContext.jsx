import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";


export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    
    let [chatHistory, setChatHistory] = useState([])
    const [contactList, setContactList] = useState([])
    const [activeChatUser, setActiveChatUser] = useState(null)
    const [unreadCounts, setUnreadCounts] = useState({})

  const { socket, axios } = useContext(AuthContext)

    const fetchContacts = async () => {
    try {
      let resp = await axios.get("/api/messages/users")
      let userData = resp.data;
      if (userData && userData.success) {
        setContactList(userData.users)
          setUnreadCounts(userData.unseenMessages)
      }
    } catch (err) {
      console.log(err)
      toast.error(err?.message || "Error")
    }
  }

    const loadConversation = async(targetId)=>{
        try {
            let endpoint = `/api/messages/${targetId}`
            if(targetId == 'global') {
                endpoint = '/api/messages/global'
            }
            let res = await axios.get(endpoint)
            if (res.data.success) {
                let msgs = res.data.messages
                let clean = msgs.filter(m => m != null)
                setChatHistory(clean)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const handleSendMessage = async (payload) => {
      try {
          var apiUrl = ''
          if (activeChatUser != null && activeChatUser._id == 'global') {
              apiUrl = `/api/messages/send/global`
          } else { 
            apiUrl = `/api/messages/send/${activeChatUser._id}`
          }

          let response = await axios.post(apiUrl, payload)
          if (response.data && response.data.success) {
              setChatHistory(prev => {
                  let arr = [...prev]
                  arr.push(response.data.newMessage)
                  return arr
              })
          } else {
              toast.error(response.data.message)
          }
      } catch (error) {
          console.error(error)
          toast.error(error.message)
      }
    }

    let setupSocketListeners = () => {
        if (!socket) return
        
        const onMsg = (msg) => {
            if (activeChatUser && msg.senderId == activeChatUser._id) {
                msg.seen = true
                setChatHistory((old) => {
                    return [...old, msg]
                })
                axios.put(`/api/messages/mark/${msg._id}`).catch(e => console.log(e))
            } else {
                setUnreadCounts((prev) => {
                    let count = prev[msg.senderId]
                    if (!count) count = 0
                    return {
                        ...prev,
                        [msg.senderId]: count + 1
                    }
                })
            }
        }

        const onGlobal = (msg) => {
            let isGlob = activeChatUser != null && activeChatUser._id == 'global'
            if (isGlob) {
                setChatHistory((old) => [...old, msg])
            } else {
                setUnreadCounts((prev) => {
                    let g = prev.global || 0
                    return { ...prev, global: g + 1 }
                })
            }
        }

        socket.on("newMessage", onMsg)
        socket.on("newGlobalMessage", onGlobal)
    }

    const removeListeners = () => {
        if (socket) {
            socket.off("newMessage")
            socket.off("newGlobalMessage")
        }
    }

    useEffect(() => {
        setupSocketListeners()
        return () => { removeListeners() }
    }, [socket, activeChatUser])

    const contextValues = { messages: chatHistory, users: contactList, selectedUser: activeChatUser, getUsers: fetchContacts, getMessages: loadConversation, sendMessage: handleSendMessage, setSelectedUser: setActiveChatUser, unseenMessages: unreadCounts, setUnseenMessages: setUnreadCounts }

    return (
        <ChatContext.Provider value={contextValues}>
            {children}
        </ChatContext.Provider>
    )
}