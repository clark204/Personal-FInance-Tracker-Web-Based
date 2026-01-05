// components/Profile.js
import React, { useRef } from "react";
import {
    User,
    Mail,
    Edit,
    CheckCircle,
    Calendar,
    Camera,
    X,
    Loader2,
    Save
} from "lucide-react";
import { useAccount } from "../../hooks/account";
import { useProfileManager } from "../../hooks/ProfileManager"; 
import AvatarUploadModal from "../modal/profile/AvatarUploadModal";

export default function Profile() {
    const { getAccounts } = useAccount();
    const accounts = getAccounts.data?.account || [];
    const fileInputRef = useRef(null);
    
    const {
        user,
        isEditing,
        setIsEditing,
        editedName,
        setEditedName,
        previewImage,
        showImageModal,
        setShowImageModal,
        handleAvatarUpdate,
        handleProfileUpdate,
        validateName,
        handleFileSelect,
        clearImageSelection,
        isUploadingAvatar,
        isUpdatingProfile,
        selectedFile
    } = useProfileManager();
    
    const formatDate = (dateString) => {
        if (!dateString) return "2025";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };
    
    const userSince = formatDate(user?.created_at || "2025-11-01");

    // Get avatar URL
    const getAvatarUrl = () => {
        if (user?.avatar) {
            if (user.avatar.startsWith('http') || user.avatar.startsWith('https')) {
                return user.avatar;
            }
            return `http://localhost:8000/storage/${user.avatar}`;
        }
        return null;
    };

    const handleSaveProfile = async () => {
        const error = validateName(editedName);
        if (error) {
            toast.error(error);
            return;
        }

        const success = await handleProfileUpdate(editedName);
        if (success) {
            setIsEditing(false);
        }
    };

    const handleStartEditing = () => {
        setEditedName(user?.name || "");
        setIsEditing(true);
    };

    const handleCancelEditing = () => {
        setIsEditing(false);
        setEditedName(user?.name || "");
    };

    const handleModalClose = () => {
        setShowImageModal(false);
        clearImageSelection();
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleQuickFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && handleFileSelect(file)) {
            setShowImageModal(true);
        }
    };

    const handleModalUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select an image first');
            return;
        }
        
        const success = await handleAvatarUpdate(selectedFile);
        if (success) {
            setShowImageModal(false);
        }
    };

    return (
        <div className="overflow-auto bg-gradient-to-br from-primary-gradient to-secondary-gradient p-4 md:p-6 h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Modern Header */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-main to-main-light rounded-2xl p-6 md:p-8 text-white">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Profile Settings</h1>
                        <p className="text-white/90">Manage your account information and preferences</p>
                    </div>
                </div>

                {/* Personal Information Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-color-border overflow-hidden">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-main/5 to-main-light/5 border-b border-color-border/30 p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-main to-main-light rounded-xl">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-color-text">Personal Information</h2>
                                    <p className="text-sm text-color-text-secondary">Your profile details</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleCancelEditing}
                                            disabled={isUpdatingProfile}
                                            className="flex items-center gap-2 px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isUpdatingProfile}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-button text-white font-semibold rounded-lg hover:bg-hover-button transition-colors disabled:opacity-50"
                                        >
                                            {isUpdatingProfile ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                            {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={handleStartEditing}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-button text-white font-semibold rounded-lg hover:bg-hover-button transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleQuickFileSelect}
                        accept="image/jpeg, image/jpg, image/png"
                        className="hidden"
                        disabled={isUploadingAvatar}
                    />
                    
                    {/* Card Content */}
                    <div className="p-6">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center">
                                <div className="relative group mb-4">
                                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-lg">
                                        {getAvatarUrl() ? (
                                            <img 
                                                src={getAvatarUrl()} 
                                                alt={user?.name || "User"} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    // Fallback to initials if image fails to load
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = `
                                                        <div class="w-full h-full bg-gradient-to-br from-main to-main-light flex items-center justify-center text-white text-4xl font-bold">
                                                            ${user?.name?.charAt(0).toUpperCase() || "U"}
                                                        </div>
                                                    `;
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-main to-main-light flex items-center justify-center text-white text-4xl font-bold">
                                                {user?.name?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                        )}
                                        
                                        {/* Upload overlay */}
                                        {!isUploadingAvatar && (
                                            <div 
                                                onClick={triggerFileInput}
                                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            >
                                                <Camera className="w-10 h-10 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    {!isUploadingAvatar && (
                                        <div 
                                            onClick={triggerFileInput}
                                            className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full border-4 border-white shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                            <Camera className="w-5 h-5 text-color-text" />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Change Avatar Button */}
                                <button 
                                    onClick={triggerFileInput}
                                    disabled={isUploadingAvatar}
                                    className="flex items-center gap-2 px-4 py-2 text-button hover:text-hover-button font-medium rounded-lg border border-button hover:border-hover-button transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUploadingAvatar ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="w-4 h-4" />
                                            Change Profile
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            {/* Profile Information Section */}
                            <div className="space-y-6 flex-1">
                                {/* Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold text-color-text-secondary uppercase tracking-wider">Username</label>
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={editedName}
                                                    onChange={(e) => setEditedName(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg border border-color-border focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus transition"
                                                    placeholder="Enter your name"
                                                    autoFocus
                                                />
                                                <p className="text-xs text-gray-500">
                                                    Enter your display name (2-50 characters)
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-color-border/30">
                                                <p className="text-lg font-semibold text-color-text">{user?.name || "Not set"}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold text-color-text-secondary uppercase tracking-wider">Email Address</label>
                                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-color-border/30 flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-color-text-secondary" />
                                            <div className="flex-1">
                                                <p className="text-lg font-semibold text-color-text">{user?.email || "No email"}</p>
                                                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Status Badges */}
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                                        <CheckCircle className="w-4 h-4" />
                                        Verified Account
                                    </span>
                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                        <Calendar className="w-4 h-4" />
                                        Since {userSince}
                                    </span>
                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                                        <User className="w-4 h-4" />
                                        {accounts.length} Account{accounts.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Avatar Upload Modal */}
            <AvatarUploadModal
                isOpen={showImageModal}
                onClose={handleModalClose}
                previewImage={previewImage}
                onUpload={handleModalUpload}
                isUploading={isUploadingAvatar}
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
            />
        </div>
    );
}