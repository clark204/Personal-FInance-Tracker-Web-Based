// hooks/useOverviewFilter.js
import { useState, useEffect } from 'react';

export const useOverviewFilter = (options = {}) => {
    const { selectedAccount = null } = options;

    const [filters, setFilters] = useState({
        datePreset: 'today',
        date_from: '',
        date_to: '',
        account_id: selectedAccount,
    });

    // 🔑 Sync account_id when selectedAccount changes
    useEffect(() => {
        if (selectedAccount !== null) {
            setFilters(prev => ({
                ...prev,
                account_id: selectedAccount,
            }));
        }
    }, [selectedAccount]);

    const applyPreset = (preset) => {
        const now = new Date();
        const start = new Date();

        if (preset === 'today') {
            start.setHours(0, 0, 0, 0);
        } else if (preset === 'week') {
            start.setDate(now.getDate() - now.getDay());
        } else if (preset === 'month') {
            start.setDate(1);
        } else if (preset === 'year') {
            start.setMonth(0, 1);
        } else if (preset === 'last_week') {
            start.setDate(now.getDate() - 7);
        } else if (preset === 'last_month') {
            start.setMonth(now.getMonth() - 1, 1);
        } else if (preset === 'last_year') {
            start.setFullYear(now.getFullYear() - 1, 0, 1);
        } else if (preset === 'custom') {
            setFilters(prev => ({
                ...prev,
                datePreset: 'custom',
                date_from: '',
                date_to: '',
            }));
            return;
        }

        setFilters(prev => ({
            ...prev,
            datePreset: preset,
            date_from: start.toISOString().slice(0, 10),
            date_to: now.toISOString().slice(0, 10),
        }));
    };

    const updateFilter = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    useEffect(() => {
        applyPreset('today');
    }, []);

    return {
        filters,
        applyPreset,
        updateFilter,
    };
};
