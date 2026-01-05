import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasAccounts, setHasAccounts] = useState(false);
    const [checkingAccounts, setCheckingAccounts] = useState(false);
    const queryClient = useQueryClient();

    // Function to check if user has accounts
    const checkUserAccounts = async () => {
        try {
            setCheckingAccounts(true);
            const response = await api.get('/accounts');
            const accounts = response.data?.data || response.data?.account || response.data;
            
            // Handle different possible response structures
            let accountArray = [];
            if (Array.isArray(accounts)) {
                accountArray = accounts;
            } else if (accounts?.account && Array.isArray(accounts.account)) {
                accountArray = accounts.account;
            }
            
            const hasAccounts = accountArray.length > 0;
            setHasAccounts(hasAccounts);
            return hasAccounts;
        } catch (error) {
            console.error('Error checking accounts:', error);
            setHasAccounts(false);
            return false;
        } finally {
            setCheckingAccounts(false);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            
            if (token && user) {
                const parsedUser = JSON.parse(user);
                setUser(parsedUser);
                
                // Set token for subsequent requests
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                // Check if user has accounts
                await checkUserAccounts();
            }
            setLoading(false);
        };
        
        initializeAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await api.get('/me');
            const authenticatedUser = response.data;
            setUser(authenticatedUser);

            localStorage.setItem('user', JSON.stringify(authenticatedUser));
            
            // Check accounts after successful auth check
            await checkUserAccounts();
        } catch (error) {
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        const response = await api.post('/login', { email, password }, { validateStatus: () => true });

        if (response.status === 401 || response.status === 403) {
            setLoading(false);
            return { success: false, message: response.data.message || 'Invalid email or password' };
        }

        if (response.status === 422) {
            setLoading(false);
            return {
                success: false,
                message: response.data.message || 'Validation failed',
                errors: response.data.errors,
            };
        }

        if (response.status !== 200 && response.status !== 201) {
            setLoading(false);
            console.error("Unexpected response:", response);
            return {
                success: false,
                message: response.data.message || 'Something went wrong',
            };
        }

        const { user, authorization } = response.data;

        if (!authorization || !authorization.token) {
            setLoading(false);
            return { success: false, message: 'Missing authorization data in response' };
        }

        // Store token and user
        localStorage.setItem('token', authorization.token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Set token for subsequent requests
        api.defaults.headers.common['Authorization'] = `Bearer ${authorization.token}`;
        
        setUser(user);
        
        // Check accounts after login
        const accountsCheck = await checkUserAccounts();
        setLoading(false);

        return { 
            success: true, 
            message: 'Login successful',
            needsAccountSetup: !accountsCheck
        };
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setHasAccounts(false);
            queryClient.clear();
        }
    };

    const register = async (name, email, password, confirmPassword) => {
        const response = await api.post('/register', {
            name,
            email,
            password,
            password_confirmation: confirmPassword
        }, {
            validateStatus: () => true
        });

        if (response.status === 201 || response.status === 200) {
            return {
                success: true,
                data: response.data || 'Registration successful. Please check your email.'
            };
        } else if (response.status === 422) {
            console.log("Validation errors:", response.data.errors);
            return {
                success: false,
                error: response.data.message || 'Validation failed',
                errors: response.data.errors
            };
        } else {
            console.log("Unexpected error:", response.data);
            return {
                success: false,
                error: response.data.message || 'Registration failed',
                errors: response.data.errors
            };
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            hasAccounts,
            checkingAccounts,
            checkUserAccounts,
            login, 
            logout, 
            checkAuth, 
            register, 
            setUser 
        }}>
            {children}
        </AuthContext.Provider>
    );
};