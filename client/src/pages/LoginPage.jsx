import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'

const LoginPage = () => {
  var [currState, setCurrState] = useState("Sign up")
  const [fullName, setFullName] = useState("")
  let [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState("")
  const [otp, setOtp] = useState("")
  const [signupOTP, setSignupOTP] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [signupStep, setSignupStep] = useState(1)
  let [isDataSubmitted, setIsDataSubmitted] = useState(false)

  const {login, requestOTP, submitResetPassword, sendSignupOTP, verifySignupOTP} = useContext(AuthContext)

  const onSubmitHandler = async (event)=>{
    event.preventDefault()

    if (currState === "Forgot Password") {
      let success = await requestOTP(email);
      if (success) setCurrState("Reset Password");
      return;
    }

    if (currState === "Reset Password") {
      let success = await submitResetPassword(email, otp, newPassword);
      if (success) {
        setCurrState("Login");
        setOtp("");
        setNewPassword("");
      }
      return;
    }

    if(currState == 'Sign up'){
      if (signupStep === 1) {
        const success = await sendSignupOTP(email, fullName);
        if (success) setSignupStep(2);
        return;
      }
      if (signupStep === 2) {
        const success = await verifySignupOTP(email, signupOTP);
        if (success) setSignupStep(3);
        return;
      }
      if (signupStep === 3) {
        setSignupStep(4);
        return;
      }
      // Step 4 is final submission
      login('signup', {fullName, email, password, bio})
    } else {
      login('login', {fullName, email, password, bio})
    }
  }

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>

      <img src={assets.logo_big} alt="" className='w-[min(30vw,250px)]'/>

      <form onSubmit={onSubmitHandler} className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currState}
          {isDataSubmitted && <img onClick={()=> setIsDataSubmitted(false)} src={assets.arrow_icon} alt="" className='w-5 cursor-pointer'/> }
         </h2>

        {currState === "Sign up" && (
            <div className="flex justify-center items-center gap-2 mb-4">
               {[1,2,3,4].map((step) => (
                   <div key={step} className={`w-3 h-3 rounded-full ${signupStep >= step ? 'bg-violet-500' : 'bg-gray-600'}`}></div>
               ))}
            </div>
        )}

        {currState === "Sign up" && signupStep === 1 && (
            <>
                <input onChange={(e)=>setFullName(e.target.value)} value={fullName} type="text" className='p-2 border border-gray-500 rounded-md focus:outline-none' placeholder="Full Name" required/>
                <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='Email Address' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
            </>
        )}

        {currState === "Sign up" && signupStep === 2 && (
            <div className="flex flex-col gap-2">
                <p className="text-center text-sm text-gray-400 font-medium">OTP sent to <span className="text-violet-400">{email}</span></p>
                <p className="text-center text-xs text-gray-500 mb-2">Check your inbox/spam</p>
                <input onChange={(e)=>setSignupOTP(e.target.value)} value={signupOTP} type="text" placeholder='Enter OTP' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center tracking-[0.5em] text-lg font-bold'/>
            </div>
        )}

        {currState === "Sign up" && signupStep === 3 && (
            <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='Set Password' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
        )}

        {currState === "Sign up" && signupStep === 4 && (
            <textarea onChange={(e)=>setBio(e.target.value)} value={bio} rows={4} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' placeholder='provide a short bio...' required></textarea>
        )}

        {currState === "Login" && (
           <>
            <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='Email Address' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
            <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='Password' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
            <p onClick={() => setCurrState("Forgot Password")} className='text-sm text-violet-400 cursor-pointer hover:underline -mt-4'>Forgot Password?</p>
           </>
        )}

        {currState === "Reset Password" && (
           <>
            <p className="text-center text-sm text-gray-400 font-medium mb-2">OTP sent to <span className="text-violet-400">{email}</span></p>
            <input onChange={(e)=>setOtp(e.target.value)} value={otp} type="text" placeholder='Enter 6-digit OTP' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center tracking-[0.5em] text-lg font-bold'/>
            <input onChange={(e)=>setNewPassword(e.target.value)} value={newPassword} type="password" placeholder='New Password' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
           </>
        )}

        {currState === "Forgot Password" && (
            <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='Email Address' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
        )}

        <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer transition-all hover:scale-105 active:scale-95'>
          {currState == "Sign up" ? (signupStep < 4 ? (signupStep === 2 ? "Verify" : "Next") : "Create Account") : currState == "Forgot Password" ? "Send OTP" : currState == "Reset Password" ? "Verify & Reset" : "Login Now"}
        </button>

        {currState === "Login" && (
          <div className='flex items-center gap-2 text-sm text-gray-500'>
            <input type="checkbox" />
            <p>Agree to the terms of use & privacy policy.</p>
          </div>
        )}

        <div className='flex flex-col gap-2'>
          {currState == "Sign up" ? (
            <p className='text-sm text-gray-600 text-center'>Already have an account? <span onClick={()=>{setCurrState("Login"); setSignupStep(1)}} className='font-medium text-violet-500 cursor-pointer'>Login here</span></p>
          ) : (
            <p className='text-sm text-gray-600 text-center'>{(currState === "Forgot Password" || currState === "Reset Password") ? "Remember your password?" : "Create an account"} <span onClick={()=> {setCurrState(currState === "Login" ? "Sign up" : "Login"); setSignupStep(1)}} className='font-medium text-violet-500 cursor-pointer'>{currState === "Login" ? "Click here" : "Login here"}</span></p>
          )}
        </div>
      </form>
    </div>
  )
}

export default LoginPage
