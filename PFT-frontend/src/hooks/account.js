import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

export const useAccount = (accountID) => {
    const token = localStorage.getItem('token');
    const queryClient = useQueryClient();

    const getAccounts = useQuery({
        queryKey: ['accounts'],
        queryFn: async () => {
            const response = await api.get('/accounts', {
                headers: { Authorization: `Bearer ${token}` }
            });

            return response.data;
        }
    });

    const showAccount = useQuery({
        queryKey: ['account', accountID],
        queryFn: async () => {
            const response = await api.get(`/accounts/${accountID}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            return response.data;
        },
        enabled: !!accountID
    })

    const createAccount = useMutation({
        mutationFn: async (newData) => {
            const response = await api.post('/accounts', newData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            return response.data;
        },
        onSuccess: () => queryClient.invalidateQueries(['accounts'])
    });

    const updateAccount = useMutation({
        mutationFn: async (updateData) => {
            const response = await api.put(`/accounts/${updateData.id}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            return response.data;
        },
        onSuccess: () => queryClient.invalidateQueries(['accounts'])
    })

    const deleteAccount = useMutation({
        mutationFn: async () => {
            const response = await api.delete(`/accounts/${accountID}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            return response.data;
        },
        onSuccess: () => queryClient.invalidateQueries(['accounts'])
    });

    return {
        getAccounts,
        showAccount,
        createAccount,
        updateAccount,
        deleteAccount
    }
};