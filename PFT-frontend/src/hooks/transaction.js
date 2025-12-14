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
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["transactions", "accounts", "budgets", "savings"]);
            toast.success('Transaction created successfully!', {
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

    // Update
    const updateTransaction = useMutation({
        mutationFn: async (updatedData) => {
            const response = await api.put(
                `/transactions/${updatedData.id}`,
                updatedData,
                { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true }
            );

            if (response.status === 400 || response.status === 403) {
                return {
                    success: false,
                    message: response.data?.message || "Failed to update transaction",
                };
            }

            if (response.status !== 200 && response.status !== 201) {
                return {
                    success: false,
                    message: response.data?.message || "Something went wrong",
                };
            }

            return { success: true, data: response.data };
        },
        onSuccess: (res) => {
            if (!res.success) return;
            queryClient.invalidateQueries(["transactions"]);
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
