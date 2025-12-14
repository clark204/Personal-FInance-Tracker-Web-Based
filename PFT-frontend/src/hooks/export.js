import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

export const useExport = () => {
    const fetchExportData = async (exportForm = {}) => {
        // Convert empty strings to undefined so they don't get sent
        const params = Object.entries(exportForm)
            .filter(([_, v]) => v !== "" && v !== null && v !== undefined)
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});

        const response = await api.get('/export', { params });
        return response.data;
    };

    // Hook to get export data with React Query
    const useExportData = (exportForm = {}) => {
        return useQuery({
            queryKey: ["export", "transactions", exportForm],
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

                if (exportForm.type === 'budgets') {
                    return data?.budgets?.length || 0;
                }

                return Array.isArray(data) ? data.length : 0;
            },
            staleTime: 1000 * 60 * 5,
        });
    };


    return {
        fetchExportData, // Original function if needed
        useExportData,
        useExportCount,
    };
};