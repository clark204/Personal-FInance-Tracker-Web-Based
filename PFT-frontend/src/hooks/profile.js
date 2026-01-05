// hooks/profile.js
import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../api/api"
import { toast } from "react-toastify";

export const useProfile = () => {
    const token = localStorage.getItem('token');
    const queryClient = useQueryClient();

    const updateProfileAvatar = useMutation({
        mutationFn: async (avatarFile) => {
            const formData = new FormData();
            formData.append('avatar', avatarFile);
            
            const response = await api.post('/profile/avatar', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            return response.data;
        },
        onSuccess: (data) => {
            toast.success('Profile picture successfully updated!', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                theme: "light",
            });
            // Invalidate any queries that might be affected
            queryClient.invalidateQueries(['user']);
            return data;
        },
        onError: (error) => {
            console.error('Avatar upload error:', error);
            const errorMessage = error.response?.data?.message 
                || error.message 
                || 'Failed to update profile picture';
            
            toast.error(errorMessage, {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                theme: "light",
            });
        }
    });

    const updateProfileInfo = useMutation({
        mutationFn: async (profileData) => {
            // Change from PUT to POST to match your route
            const response = await api.post('/profile', profileData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        },
        onSuccess: (data) => {
            toast.success('Profile updated successfully!', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                theme: "light",
            });
            // Invalidate any queries that might be affected
            queryClient.invalidateQueries(['user']);
            return data;
        },
        onError: (error) => {
            console.error('Profile update error:', error);
            const errorMessage = error.response?.data?.message 
                || error.message 
                || 'Failed to update profile';
            
            toast.error(errorMessage, {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                theme: "light",
            });
        }
    });

    return {
        updateProfileAvatar,
        updateProfileInfo
    };
}