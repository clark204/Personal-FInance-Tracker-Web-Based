// hooks/setting.js
import { Bounce, toast } from "react-toastify";
import api from "../api/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useSetting = () => {
    const token = localStorage.getItem('token');
    const queryClient = useQueryClient();

    const getNotifications = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const response = await api.get('/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        }
    });

    const updateNotification = useMutation({
        mutationFn: async (updatedData) => {
            const response = await api.post(`/notification-settings`, {
                email_notifications: updatedData.email_notifications,
                budget_alerts: updatedData.budget_alerts,
                savings_alerts: updatedData.savings_alerts,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
            toast.success('Notifications updated successfully!', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        },
        onError: (error) => {
            if (error.response?.status === 401) {
                toast.error('Unauthorized. Please login again.', {
                    position: "bottom-right",
                    transition: Bounce
                });
            } else {
                toast.error('Failed to update notifications.', {
                    position: "bottom-right",
                    transition: Bounce
                });
            }
        }
    });

    const changePassword = useMutation({
        mutationFn: async (changePasswordData) => {
            const response = await api.post('/settings/change-password', {
                current_password: changePasswordData.current,
                new_password: changePasswordData.new,
                new_password_confirmation: changePasswordData.confirm
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Password changed successfully!', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message
                || error.message
                || 'Failed to change password';

            toast.error(errorMessage, {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }
    });

    // the deleteAccount mutation
    const deleteAccount = useMutation({
        mutationFn: async (deleteData) => {
            try {
                const response = await api.post('/delete/account', deleteData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                return response.data;
            } catch (error) {
                // Throw the error so React Query can handle it properly
                throw error;
            }
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Account deleted successfully!', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                theme: "light",
                transition: Bounce,
            });

            // Clear local storage and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = '/auth?mode=login';
            }, 2000);
        },
        onError: (error) => {
            console.error('Delete account error:', error);
            const errorMessage = error.response?.data?.message
                || error.message
                || 'Failed to delete account';

            toast.error(errorMessage, {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                theme: "light",
                transition: Bounce,
            });
        }
    });

    return {
        getNotifications,
        updateNotification,
        changePassword,
        deleteAccount
    };
};