import mongoose from "mongoose"

export let connectDB = async () =>{
    try {
        mongoose.connection.on('connected', ()=> console.log('Database Connected'))
       await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`) 
    } catch (error) {
        console.log(error)
    }
}