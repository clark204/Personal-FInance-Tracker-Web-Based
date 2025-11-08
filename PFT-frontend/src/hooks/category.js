import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

export const useCategory = (categoryId) => {
    const token = localStorage.getItem('token');
    const queryClient = useQueryClient();

    // Fetch all categories
    const getCategories = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        }
    });

    // Fetch single category
    const showCategory = useQuery({
        queryKey: ['category', categoryId],
        queryFn: async () => {
            const response = await api.get(`/categories/${categoryId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        },
        enabled: !!categoryId
    });

    // Create category
    const createCategory = useMutation({
        mutationFn: async (newData) => {
            const response = await api.post('/categories', newData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        },
        onSuccess: () => queryClient.invalidateQueries(['categories'])
    });

    // Update category
    const updateCategory = useMutation({
        mutationFn: async (updatedData) => {
            const response = await api.put(`/categories/${updatedData.id}`, updatedData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        },
        onSuccess: () => queryClient.invalidateQueries(['categories'])
    });

    // Delete category
    const deleteCategory = useMutation({
        mutationFn: async (categoryId) => {
            const response = await api.delete(`/categories/${categoryId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        },
        onSuccess: () => queryClient.invalidateQueries(['categories'])
    });

    return {
        getCategories,
        showCategory,
        createCategory,
        updateCategory,
        deleteCategory
    };
};
