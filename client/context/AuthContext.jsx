import { createContext, useEffect, useState } from "react"
import axios from 'axios'
import toast from "react-hot-toast"
import { io } from "socket.io-client"

let backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext()

export const AuthProvider = ({ children })=>{

    var [token, setToken] = useState(localStorage.getItem("token"))
    let [authUser, setAuthUser] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])
    const [socket, setSocket] = useState(null)

    const checkAuth = async () => {
        try {
            let res = await axios.get("/api/auth/check")
            if (res.data.success) {
                setAuthUser(res.data.user)
                connectSocket(res.data.user)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

const login = async (state, credentials)=>{
    try {
        let req = await axios.post(`/api/auth/${state}`, credentials)
        let data = req.data
        if (data.success){
            setAuthUser(data.userData)
            connectSocket(data.userData)
            axios.defaults.headers.common["token"] = data.token
            setToken(data.token)
            localStorage.setItem("token", data.token)
            toast.success(data.message)
        }else{
            toast.error(data.message)
        }
    } catch (error) {
        toast.error(error.message)
    }
}

    let logout = async () =>{
        localStorage.removeItem("token")
        setToken(null)
        setAuthUser(null)
        setOnlineUsers([])
        axios.defaults.headers.common["token"] = null
        toast.success("Logged out successfully")
        socket.disconnect()
    }

    const updateProfile = async (body)=>{
        try {
            let res = await axios.put("/api/auth/update-profile", body)
            if(res.data.success){
                setAuthUser(res.data.user)
                toast.success("Profile updated successfully")
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const requestOTP = async (email) => {
        try {
            let res = await axios.post("/api/auth/forgot-password", { email });
            if (res.data.success) {
                toast.success(res.data.message);
                return true;
            } else {
                toast.error(res.data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    const submitResetPassword = async (email, otp, newPassword) => {
        try {
            let res = await axios.post("/api/auth/reset-password", { email, otp, newPassword });
            if (res.data.success) {
                toast.success(res.data.message);
                return true;
            } else {
                toast.error(res.data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    const sendSignupOTP = async (email, fullName) => {
        try {
            let res = await axios.post("/api/auth/send-signup-otp", { email, fullName });
            if (res.data.success) {
                toast.success(res.data.message);
                return true;
            } else {
                toast.error(res.data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    const verifySignupOTP = async (email, otp) => {
        try {
            let res = await axios.post("/api/auth/verify-signup-otp", { email, otp });
            if (res.data.success) {
                toast.success(res.data.message);
                return true;
            } else {
                toast.error(res.data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    const connectSocket = (userData)=>{
        if(!userData) return
        if(socket?.connected) return
        
        let newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            },
            transports: ["websocket"],
        })
        newSocket.connect()
        setSocket(newSocket)

        newSocket.on("getOnlineUsers", (userIds)=>{
            setOnlineUsers(userIds)
        })
    }

    useEffect(()=>{
        if(token){ axios.defaults.headers.common["token"] = token }
        checkAuth()
    },[])

    const value = { axios, authUser, onlineUsers, socket, login, logout, updateProfile, requestOTP, submitResetPassword, sendSignupOTP, verifySignupOTP }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}