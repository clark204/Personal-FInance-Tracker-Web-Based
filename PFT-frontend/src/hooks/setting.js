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
                headers: { Authorization : `Bearer ${token}` }
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
                toast.error('Unauthorized. Please login again.', { position: "bottom-right", transition: Bounce });
            } else {
                toast.error('Failed to update notifications.', { position: "bottom-right", transition: Bounce });
            }
        }
    });

    return {
        getNotifications,
        updateNotification,
    };
};
