// components/EditProfileModal.js
import { AnimatePresence, motion } from "framer-motion";
import { X, User, Mail, Camera, Save, Loader2 } from "lucide-react";
import { memo, useRef } from "react";
import { useProfileManager } from "../../../hooks/ProfileManager";
import { toast } from "react-toastify";

// Memoized input field component
const ProfileInputField = memo(({
    icon: Icon,
    label,
    name,
    value,
    onChange,
    placeholder,
    type = "text",
    disabled = false,
    readOnly = false,
    error = ""
}) => {
    return (
        <div>
            <label htmlFor={name} className="text-xs font-medium text-gray-700 mb-1 block">
                {label} {readOnly && <span className="text-gray-400">(read-only)</span>}
            </label>
            <div className="relative">
                <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 ${readOnly ? 'text-gray-300' : 'text-gray-400'}`}>
                    <Icon className="w-3.5 h-3.5" />
                </div>
                <input
                    id={name}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled || readOnly}
                    readOnly={readOnly}
                    className={`w-full border rounded-lg pl-9 pr-3 py-2 text-sm transition-colors duration-150
                        ${readOnly
                            ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                            : 'border-gray-300 text-gray-900 focus:border-focus focus:ring-1 focus:ring-focus/20'
                        }
                        ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {error && (
                    <p className="mt-1 text-xs text-red-600">{error}</p>
                )}
            </div>
        </div>
    );
});

ProfileInputField.displayName = 'ProfileInputField';

export default function EditProfileModal({ isOpen, onClose }) {
    const fileInputRef = useRef(null);

    const {
        user,
        editedName,
        setEditedName,
        previewImage,
        handleAvatarUpdate,
        handleProfileUpdate,
        validateName,
        handleFileSelect,
        clearImageSelection,
        isUploadingAvatar,
        isUpdatingProfile,
        selectedFile
    } = useProfileManager();

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name') {
            setEditedName(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const error = validateName(editedName);
        if (error) {
            toast.error(error);
            return;
        }

        const success = await handleProfileUpdate(editedName);
        if (success) {
            onClose();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && handleFileSelect(file)) {
            // No need to set preview here, it's handled in the hook
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select an image first');
            return;
        }

        const success = await handleAvatarUpdate(selectedFile);
        if (success) {
            clearImageSelection();
            toast.success('Profile picture updated successfully!');
        }
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs"
                        onClick={isUpdatingProfile || isUploadingAvatar ? undefined : onClose}
                    />

                    {/* Modal - Compact size */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{
                                type: "tween",
                                duration: 0.2,
                                ease: "easeOut"
                            }}
                            className="bg-white rounded-lg shadow-lg w-full max-w-sm overflow-hidden border border-gray-200 pointer-events-auto"
                        >
                            {/* Compact Header */}
                            <div className="bg-gradient-to-r from-primary-gradient to-secondary-gradient border-b border-border/30 p-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-white rounded-md border border-gray-200">
                                            <User className="w-4 h-4 text-icon" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-text">
                                                Edit Profile
                                            </h2>
                                            <p className="text-xs text-text-secondary">
                                                Update your profile information
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        disabled={isUpdatingProfile || isUploadingAvatar}
                                        className="p-1.5 hover:bg-white/50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        aria-label="Close modal"
                                    >
                                        <X className="w-4 h-4 text-text" />
                                    </button>
                                </div>
                            </div>

                            {/* Compact Form */}
                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                {/* Avatar Section */}
                                <div className="flex flex-col items-center">
                                    <div className="relative group mb-3">
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                                            {previewImage ? (
                                                <img
                                                    src={previewImage}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : getAvatarUrl() ? (
                                                <img
                                                    src={getAvatarUrl()}
                                                    alt={user?.name || "User"}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = `
                                                            <div class="w-full h-full bg-gradient-to-br from-main to-main-light flex items-center justify-center text-white text-xl font-bold">
                                                                ${user?.name?.charAt(0).toUpperCase() || "U"}
                                                            </div>
                                                        `;
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-main to-main-light flex items-center justify-center text-white text-xl font-bold">
                                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                                </div>
                                            )}

                                            {/* Upload overlay */}
                                            {!isUploadingAvatar && (
                                                <div
                                                    onClick={triggerFileInput}
                                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                >
                                                    <Camera className="w-5 h-5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hidden file input */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/jpeg, image/jpg, image/png"
                                        className="hidden"
                                        disabled={isUploadingAvatar}
                                    />

                                    {/* Upload/Cancel Button */}
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={triggerFileInput}
                                            disabled={isUploadingAvatar}
                                            className="px-3 py-1.5 text-xs border border-button text-button rounded-md hover:bg-button/5 transition-colors disabled:opacity-50"
                                        >
                                            {previewImage ? 'Change Photo' : 'Change Avatar'}
                                        </button>

                                        {previewImage && (
                                            <button
                                                type="button"
                                                onClick={handleAvatarUpload}
                                                disabled={isUploadingAvatar}
                                                className="px-3 py-1.5 text-xs bg-button text-white rounded-md hover:bg-hover-button transition-colors disabled:opacity-50 flex items-center gap-1"
                                            >
                                                {isUploadingAvatar ? (
                                                    <>
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                        Uploading
                                                    </>
                                                ) : 'Upload'}
                                            </button>
                                        )}
                                    </div>

                                    <p className="mt-1 text-xs text-gray-500 text-center max-w-[200px]">
                                        {isUploadingAvatar ? 'Uploading...' : 'JPG, PNG up to 2MB'}
                                    </p>
                                </div>

                                {/* Name Field */}
                                <ProfileInputField
                                    icon={User}
                                    label="Full Name"
                                    name="name"
                                    value={editedName}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    disabled={isUpdatingProfile}
                                    error={validateName(editedName)}
                                />

                                {/* Email Field (Read-only) */}
                                <ProfileInputField
                                    icon={Mail}
                                    label="Email Address"
                                    name="email"
                                    value={user?.email || ""}
                                    readOnly={true}
                                    placeholder="Your email address"
                                />

                                {/* Compact Buttons */}
                                <div className="flex gap-2 pt-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isUpdatingProfile || isUploadingAvatar}
                                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm 
                                                 font-medium hover:bg-gray-50 transition-colors duration-150
                                                 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdatingProfile || isUploadingAvatar}
                                        className="flex-1 px-3 py-2 rounded-lg bg-button text-white text-sm font-medium 
                                                 hover:bg-hover-button transition-colors duration-150
                                                 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer 
                                                 flex items-center justify-center gap-1.5"
                                    >
                                        {isUpdatingProfile ? (
                                            <>
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-3.5 h-3.5" />
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}