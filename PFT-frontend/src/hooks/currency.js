import { useQuery} from "@tanstack/react-query";
import api from "../api/api";

export const useCurrency = () => {

    const token = localStorage.getItem('token');

    const getCurrencies = useQuery({
        queryKey: ['currencies'],
        queryFn: async () => {
            const response = await api.get('/currencies', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        }
    });

    return {
        getCurrencies
    }
}