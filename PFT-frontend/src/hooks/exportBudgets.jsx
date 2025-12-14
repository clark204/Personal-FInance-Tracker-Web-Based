import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

export const useExportBudgets = () => {
    const fetchExportData = async (exportForm = {}) => {
        // Convert empty strings to undefined so they don't get sent
        const params = Object.entries(exportForm)
            .filter(([_, v]) => v !== "" && v !== null && v !== undefined)
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});

        const response = await api.get('/export/budgets', { params });
        return response.data;
    };

    // Hook to get export data with React Query
    const exportDataBudget = (exportForm = {}) => {
        return useQuery({
            queryKey: ["budgets", exportForm],
            queryFn: () => fetchExportData(exportForm),
            enabled: false, // Don't fetch automatically
            staleTime: 0, // Don't cache export data
            retry: false, // Don't retry on error
        });
    };

    // Hook to get export count (for preview)
    const useExportCount = (exportForm = {}) => {
        return useQuery({
            queryKey: ["count", exportForm],
            queryFn: async () => {
                const data = await fetchExportData(exportForm);
                return Array.isArray(data) ? data.length : 0;
            },
            staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        });
    };

    return {
        fetchExportData, // Original function if needed
        useExportData,
        useExportCount,
    };
};