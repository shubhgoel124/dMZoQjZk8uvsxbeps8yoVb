import jwt from "jsonwebtoken"

export let generateToken = (userId)=>{
    var token = jwt.sign({userId}, process.env.JWT_SECRET)
    return token
}