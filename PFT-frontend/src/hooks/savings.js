import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";
import { Bounce, toast } from "react-toastify";

export const useSavings = (savingsID = null, filters = {}) => {
    const token = localStorage.getItem("token");
    const queryClient = useQueryClient();

    const getSavings = useQuery({
        queryKey: ["savings", filters],
        queryFn: async () => {
            const response = await api.get("/savings", {
                params: filters,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        }
    });

    const createSavings = useMutation({
        mutationFn: async (newData) => {
            const response = await api.post("/savings", newData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["savings"] });
            toast.success('Savings created successfully!', {
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


    const showSaving = useQuery({
        queryKey: ["savings", savingsID],
        queryFn: async () => {
            const response = await api.get(`/savings/${savingsID}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        },
        enabled: !!savingsID
    });

    const updateSaving = useMutation({
        mutationFn: async (updateData) => {
            const response = await api.put(`/savings/${savingsID}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["savings", savingsID] });
            queryClient.invalidateQueries({ queryKey: ["savings"] });
            toast.success('Savings updated successfully!', {
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

    const deleteSaving = useMutation({
        mutationFn: async () => {
            const response = await api.delete(`/savings/${savingsID}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["savings"] });
            toast.success(`Savings deleted successfully!`, {
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
            toast.error("Failed to delete savings. Please try again.", {
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

    const createSavingsTransaction = useMutation({
        mutationFn: async (newData) => {
            const response = await api.post("/savings-transactions", newData, {
                headers: { Authorization: `Bearer ${token}` },
                validateStatus: (status) => true,
            });

            // If Laravel returns an error status
            if (response.status >= 400) {
                return { success: false, data: response.data };
            }

            return { success: true, data: response.data };
        },

        onSuccess: (res) => {
            if (!res.success) {
                // Handle custom backend errors (400 responses)
                if (res.data.message) {
                    toast.error(res.data.message, {
                        position: "bottom-right",
                        autoClose: 5000,
                        theme: "light",
                        transition: Bounce,
                    });
                }
                // Handle Laravel validation errors (422)
                else if (res.data.errors) {
                    const firstKey = Object.keys(res.data.errors)[0];
                    const errorMessage = res.data.errors[firstKey][0];
                    toast.error(errorMessage, {
                        position: "bottom-right",
                        autoClose: 5000,
                        theme: "light",
                        transition: Bounce,
                    });
                } else {
                    toast.error("Transaction failed", {
                        position: "bottom-right",
                        autoClose: 5000,
                        theme: "light",
                        transition: Bounce,
                    });
                }
                return;
            }

            // Success case
            queryClient.invalidateQueries({ queryKey: ["savings", savingsID] });
            queryClient.invalidateQueries({ queryKey: ["savings"] });
            queryClient.invalidateQueries(["accounts"]);

            toast.success(res.data.message || "Transaction completed successfully!", {
                position: "bottom-right",
                autoClose: 5000,
                theme: "light",
                transition: Bounce,
            });
        },
    });


    return {
        getSavings,
        createSavings,
        showSaving,
        updateSaving,
        deleteSaving,
        createSavingsTransaction
    }
}