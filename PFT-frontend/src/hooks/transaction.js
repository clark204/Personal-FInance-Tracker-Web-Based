import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "../api/api"
export const useTransaction = () => {
    const token = localStorage.getItem('token');
    const queryClient = useQueryClient();

    const getTransactions = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            const response = await api.get('/transactions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        }
    });

    const createTransaction = useMutation({
        mutationFn: async (newData) => {
            const response = await api.post('/transactions', newData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        }
    });

    const updateTransaction = useMutation({
        mutationFn: async (updatedData) => {
            const response = await api.put(`/transactions/${updatedData.id}`, updatedData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        }
    });

    const deleteTransaction = useMutation({
        mutationFn: async (transactionId) => {
            const response = await api.delete(`/transactions/${transactionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        }, onSuccess: () => {
            queryClient.invalidateQueries(['transactions']);
        }
    })

    return {
        getTransactions,
        createTransaction,
        updateTransaction,
        deleteTransaction
    }
}

export const useShowTransaction = (transactionId) => {
    const token = localStorage.getItem('token');

    return useQuery({
        queryKey: ['transaction', transactionId],
        queryFn: async () => {
            const response = await api.get(`/transactions/${transactionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        },
        enabled: !!transactionId
    });
};
