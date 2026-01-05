// hooks/useProfileManager.js
import { useState, useCallback } from 'react';
import { useProfile } from './profile';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export const useProfileManager = () => {
    const { user, setUser } = useAuth();
    const { updateProfileAvatar, updateProfileInfo } = useProfile();

    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(user?.name || '');
    const [previewImage, setPreviewImage] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const updateUserData = useCallback((data) => {
        setUser(prev => ({ ...prev, ...data }));

        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
            ...storedUser,
            ...data
        }));
    }, [setUser]);

    const handleAvatarUpdate = async (file) => {
        try {
            const result = await updateProfileAvatar.mutateAsync(file);
            if (result) {
                updateUserData({
                    avatar: result.avatar_url || result.avatar
                });
                setSelectedFile(null);
                setPreviewImage(null);
                return true;
            }
        } catch (error) {
            console.error('Avatar upload error:', error);
        }
        return false;
    };

    const handleProfileUpdate = async (name) => {
        try {
            const result = await updateProfileInfo.mutateAsync({ name });
            if (result) {
                updateUserData({ name });
                return true;
            }
        } catch (error) {
            console.error('Profile update error:', error);
        }
        return false;
    };

    const validateName = (name) => {
        if (!name.trim()) return 'Name is required';
        if (name.length < 2) return 'Name must be at least 2 characters';
        if (name.length > 50) return 'Name must be less than 50 characters';
        return null;
    };

    const validateImage = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (!validTypes.includes(file.type)) {
            return 'Please select a valid image file (JPG, JPEG, or PNG)';
        }

        if (file.size > maxSize) {
            return 'Image size should be less than 2MB';
        }

        return null;
    };

    const handleFileSelect = (file) => {
        const error = validateImage(file);
        if (error) {
            toast.error(error);
            return false;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewImage(e.target.result);
        };
        reader.readAsDataURL(file);

        return true;
    };

    const clearImageSelection = () => {
        setSelectedFile(null);
        setPreviewImage(null);
    };

    return {
        // State
        isEditing,
        setIsEditing,
        editedName,
        setEditedName,
        previewImage,
        setPreviewImage,
        showImageModal,
        setShowImageModal,
        selectedFile,
        setSelectedFile,

        // User data
        user,

        // Operations
        handleAvatarUpdate,
        handleProfileUpdate,
        handleFileSelect,
        clearImageSelection,

        // Validations
        validateName,
        validateImage,

        // Loading states
        isUploadingAvatar: updateProfileAvatar.isLoading,
        isUpdatingProfile: updateProfileInfo.isLoading,

        // Mutation objects
        updateProfileAvatar,
        updateProfileInfo
    };
};