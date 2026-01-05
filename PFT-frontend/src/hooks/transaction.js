import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";
import { Bounce, toast } from "react-toastify";

export const useTransaction = (transactionID = null, filters = {}) => {
    const token = localStorage.getItem("token");
    const queryClient = useQueryClient();

    // Fetch all transactions
    const getTransactions = useQuery({
        queryKey: ["transactions", filters],
        queryFn: async () => {
            const response = await api.get("/transactions", {
                params: filters,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        }
    });

    // Create
    const createTransaction = useMutation({
        mutationFn: async (newData) => {
            const response = await api.post("/transactions", newData, {
                headers: { Authorization: `Bearer ${token}` },
                validateStatus: (status) => true,
            });

            if (response.status >= 400) {
                return { success: false, data: response.data };
            }

            return { success: true, data: response.data };
        },
        onSuccess: (res) => {
            if (!res.success) {
                if (res.data.message) {
                    toast.error(res.data.message, {
                        position: "bottom-right",
                        autoClose: 5000,
                        theme: "light",
                        transition: Bounce,
                    });
                } else if (res.data.error) {
                    toast.error(res.data.error, {
                        position: "bottom-right",
                        autoClose: 5000,
                        theme: "light",
                        transition: Bounce,
                    });
                } else if (res.data.errors) {
                    const firstKey = Object.keys(res.data.errors)[0];
                    const errorMessage = res.data.errors[firstKey][0];
                    toast.error(errorMessage, {
                        position: "bottom-right",
                        autoClose: 5000,
                        theme: "light",
                        transition: Bounce,
                    });
                }
                return;
            }

            queryClient.invalidateQueries(["transactions", "accounts", "budgets", "savings"]);
            toast.success(res.data.message || 'Transaction created successfully!', {
                position: "bottom-right",
                autoClose: 5000,
                theme: "light",
                transition: Bounce,
            });
        }
    });

    // Update
    const updateTransaction = useMutation({
        mutationFn: async (updatedData) => {
            const response = await api.put(
                `/transactions/${updatedData.id}`,
                updatedData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    validateStatus: (status) => true
                }
            );

            if (response.status >= 400) {
                return { success: false, data: response.data };
            }

            return { success: true, data: response.data };
        },
        onSuccess: (res) => {
            if (!res.success) {
                if (res.data.message) {
                    toast.error(res.data.message, {
                        position: "bottom-right",
                        autoClose: 5000,
                        theme: "light",
                        transition: Bounce,
                    });
                } else if (res.data.error) {
                    toast.error(res.data.error, {
                        position: "bottom-right",
                        autoClose: 5000,
                        theme: "light",
                        transition: Bounce,
                    });
                } else if (res.data.errors) {
                    const firstKey = Object.keys(res.data.errors)[0];
                    const errorMessage = res.data.errors[firstKey][0];
                    toast.error(errorMessage, {
                        position: "bottom-right",
                        autoClose: 5000,
                        theme: "light",
                        transition: Bounce,
                    });
                }
                return;
            }

            queryClient.invalidateQueries(["transactions", "accounts", "budgets", "savings"]);
            toast.success('Transaction updated successfully!', {
                position: "bottom-right",
                autoClose: 5000,
                theme: "light",
                transition: Bounce,
            });
        },
    });

    // Delete
    const deleteTransaction = useMutation({
        mutationFn: async (transactionId) => {
            const response = await api.delete(`/transactions/${transactionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["transactions"]);
            toast.success('Transaction successfully deleted!', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            })
        },
        onError: () => {
            toast.error("Failed to Transaction. Please try again.", {
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

    // Fetch single transaction
    const showTransaction = useQuery({
        queryKey: ["transaction", transactionID],
        queryFn: async () => {
            const response = await api.get(`/transactions/${transactionID}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        },
        enabled: !!transactionID
    });

    return {
        getTransactions,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        showTransaction
    };
};
