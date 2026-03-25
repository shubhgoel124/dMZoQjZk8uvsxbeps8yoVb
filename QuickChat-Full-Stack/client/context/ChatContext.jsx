import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";


export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

    const [chatHistory, setChatHistory] = useState([]);
    const [contactList, setContactList] = useState([]);
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});

    // pull socket and axios from auth context
    const { socket, axios } = useContext(AuthContext);

    // get all users for the sidebar list
    const fetchContacts = async () => {
        try {
            const response = await axios.get("/api/messages/users");
            const userData = response.data;
            
            if (userData && userData.success) {
                setContactList(userData.users);
                setUnreadCounts(userData.unseenMessages);
            }
        } catch (err) {
            console.error("Failed to fetch friends list:", err);
            toast.error(err?.message || "Something went wrong fetching users");
        }
    };

    // load previous messages for whoever we clicked on
    const loadConversation = async (targetId) => {
        try {
            // determine which api endpoint to hit
            let endpoint = `/api/messages/${targetId}`;
            if (targetId === 'global') {
                endpoint = '/api/messages/global';
            }
            
            const result = await axios.get(endpoint);
            
            if (result.data.success) {
                let fetchedMessages = result.data.messages;
                
                // Just filtering out nulls as a safety check before setting state
                let cleanMessages = fetchedMessages.filter(msg => msg !== null);
                setChatHistory(cleanMessages);
            }
        } catch (error) {
            console.log("Error loading conversation:", error);
            toast.error(error.message);
        }
    };

    // logic for sending a new text
    const handleSendMessage = async (payload) => {
        try {
            let apiUrl = '';
            
            // Check if we are in the global room vs dm
            if (activeChatUser !== null && activeChatUser._id === 'global') {
                apiUrl = `/api/messages/send/global`;
            } else {
                apiUrl = `/api/messages/send/${activeChatUser._id}`;
            }

            const response = await axios.post(apiUrl, payload);
            
            if (response.data && response.data.success) {
                const newMsg = response.data.newMessage;
                
                // using the push method on a copy of the array just to be safe
                setChatHistory(prev => {
                    let updatedMsgs = [...prev];
                    updatedMsgs.push(newMsg);
                    return updatedMsgs;
                });
            } else {
                toast.error(response.data.message);
            }
            
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error(error.message);
        }
    };

    const setupSocketListeners = () => {
        if (!socket) {
            return; // don't do anything if no socket is connected
        }

        const handleIncomingMessage = (msg) => {
            // check if the message is from the guy we are currently talking to
            if (activeChatUser && msg.senderId === activeChatUser._id) {
                // mark as seen right away since we have the chat open
                msg.seen = true;
                setChatHistory((oldMessages) => {
                    return [...oldMessages, msg];
                });
                
                // notify backend that we saw it
                axios.put(`/api/messages/mark/${msg._id}`).catch(e => console.error("Could not mark as seen", e));
            } else {
                // increase unread count for this sender by doing a manual check
                setUnreadCounts((prevUnread) => {
                    let currentCount = prevUnread[msg.senderId];
                    if (!currentCount) {
                        currentCount = 0;
                    }
                    
                    return {
                        ...prevUnread,
                        [msg.senderId]: currentCount + 1
                    };
                });
            }
        };

        const handleGlobalMessage = (msg) => {
            let isGlobalActive = activeChatUser !== null && activeChatUser._id === 'global';
            
            if (isGlobalActive) {
                setChatHistory((old) => {
                    return [...old, msg];
                });
            } else {
                setUnreadCounts((prevCounts) => {
                    const currentGlobal = prevCounts.global || 0;
                    return {
                        ...prevCounts,
                        global: currentGlobal + 1
                    };
                });
            }
        };

        // attach the events
        socket.on("newMessage", handleIncomingMessage);
        socket.on("newGlobalMessage", handleGlobalMessage);
    };

    const clearListeners = () => {
        if (socket) {
            socket.off("newMessage");
            socket.off("newGlobalMessage");
        }
    };

    // run whenever socket or active user changes
    useEffect(() => {
        setupSocketListeners();
        
        return () => {
            clearListeners();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, activeChatUser]);

    // bundle everything up for the provider
    const contextValues = {
        messages: chatHistory, 
        users: contactList, 
        selectedUser: activeChatUser, 
        getUsers: fetchContacts, 
        getMessages: loadConversation, 
        sendMessage: handleSendMessage, 
        setSelectedUser: setActiveChatUser, 
        unseenMessages: unreadCounts, 
        setUnseenMessages: setUnreadCounts
    };

    return (
        <ChatContext.Provider value={contextValues}>
            {children}
        </ChatContext.Provider>
    );
}