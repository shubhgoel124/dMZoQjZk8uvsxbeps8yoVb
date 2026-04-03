import React from 'react'
import assets from '../assets/assets'
import { formatLastSeen } from '../lib/utils'

const UserProfileModal = ({ user, isOnline, onClose }) => {
    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-[#1f2130] w-[90%] max-w-sm rounded-2xl p-6 relative flex flex-col items-center border border-gray-700 shadow-2xl" 
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    ✕
                </button>

                {/* Profile Picture */}
                <div className="relative mt-4">
                    <img 
                        src={user.profilePic || assets.avatar_icon} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-[#2b2d42]"
                    />
                    {isOnline && (
                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-[#1f2130] rounded-full"></div>
                    )}
                </div>

                {/* Name */}
                <h2 className="text-2xl font-semibold text-white mt-4 tracking-wide text-center">
                    {user.fullName}
                </h2>

                {/* Status / Last Seen */}
                <p className={`mt-1 text-sm font-medium ${isOnline ? 'text-green-400' : 'text-gray-400'}`}>
                    {isOnline ? 'Active Now' : `Last seen: ${formatLastSeen(user.lastSeen || user.updatedAt)}`}
                </p>

                {/* Bio / About */}
                <div className="mt-6 w-full text-center px-4">
                    <h3 className="text-xs uppercase text-gray-500 font-semibold tracking-wider mb-2">About</h3>
                    <p className="text-gray-300 text-sm italic font-light">
                        {user.bio || "Available"}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default UserProfileModal;
