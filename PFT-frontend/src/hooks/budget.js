import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";
import { Bounce, toast } from "react-toastify";

export const useBudget = (budgetID = null, filters = {}) => {
    const token = localStorage.getItem('token');
    const queryClient = useQueryClient();

    const getBudgets = useQuery({
        queryKey: ['budgets', filters],
        queryFn: async () => {
            const response = await api.get('/budgets', {
                params: filters,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        }
    });

    const showBudget = useQuery({
        queryKey: ['budget', budgetID],
        queryFn: async () => {
            const response = await api.get(`/budgets/${budgetID}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        },
        enabled: !!budgetID
    });

    const createBudget = useMutation({
        mutationFn: async (newData) => {
            const response = await api.post('/budgets', newData, {
                headers: { Authorization: `Bearer ${token}` },
                validateStatus: (status) => true, // Allow handling all status codes manually
            });

            // If Laravel returns an error status
            if (response.status >= 400) {
                return { success: false, message: response.data?.message || 'Failed to create budget' };
            }

            return { success: true, data: response.data };
        },
        onSuccess: (res) => {
            if (!res.success) {
                toast.error(res.message, {
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                });
                return;
            }

            queryClient.invalidateQueries(['budgets']);
            toast.success('Budget created successfully!', {
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
    });


    const updateBudget = useMutation({
        mutationFn: async (updateData) => {
            const response = await api.put(`/budgets/${updateData.id}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['budgets']);
            toast.success('Updated successfully!', {
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

    const deleteBudget = useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/budgets/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['budgets']);
            toast.success(`Budget deleted successfully!`, {
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
        onError: () => {
            toast.error("Failed to delete budget. Please try again.", {
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

    return {
        getBudgets,
        showBudget,
        createBudget,
        updateBudget,
        deleteBudget
    };
}