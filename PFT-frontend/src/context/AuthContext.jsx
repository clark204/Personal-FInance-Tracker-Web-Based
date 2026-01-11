import { createContext, useContext, useEffect, useState, useRef } from "react";
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
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const queryClient = useQueryClient();
    const initialLoadRef = useRef(true);

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

    // Function to update auth headers
    const updateAuthHeaders = (token) => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);

                    // Set headers first
                    updateAuthHeaders(token);

                    // Verify token is still valid
                    const response = await api.get('/me');
                    const verifiedUser = response.data || parsedUser;

                    setUser(verifiedUser);
                    localStorage.setItem('user', JSON.stringify(verifiedUser));

                    // Check if user has accounts
                    await checkUserAccounts();
                } catch (error) {
                    console.error('Token verification failed:', error);
                    // Clear invalid auth data
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    updateAuthHeaders(null);
                    setUser(null);
                }
            }

            setLoading(false);
            initialLoadRef.current = false;
        };

        if (initialLoadRef.current) {
            initializeAuth();
        }
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
        // Prevent multiple login attempts
        if (isLoggingIn) {
            return { success: false, message: 'Login already in progress' };
        }

        setIsLoggingIn(true);
        setLoading(true);

        try {
            const response = await api.post('/login', { email, password }, {
                validateStatus: () => true,
                timeout: 10000
            });

            console.log('Login response:', response);

            // Handle specific status codes
            if (response.status === 401 || response.status === 403) {
                return {
                    success: false,
                    message: response.data?.message || 'Invalid email or password'
                };
            }

            if (response.status === 422) {
                return {
                    success: false,
                    message: response.data?.message || 'Validation failed',
                    errors: response.data?.errors,
                };
            }

            if (response.status !== 200 && response.status !== 201) {
                console.error("Unexpected response:", response);
                return {
                    success: false,
                    message: response.data?.message || 'Something went wrong',
                };
            }

            const { user, authorization } = response.data;

            if (!authorization || !authorization.token) {
                return {
                    success: false,
                    message: 'Missing authorization data in response'
                };
            }

            // Store token and user
            localStorage.setItem('token', authorization.token);
            localStorage.setItem('user', JSON.stringify(user));

            // Update auth headers
            updateAuthHeaders(authorization.token);

            // Update user state - this triggers re-renders
            setUser(user);

            // Wait for state update to complete
            await new Promise(resolve => setTimeout(resolve, 0));

            // Check accounts after login
            const accountsCheck = await checkUserAccounts();

            // Wait a bit more to ensure all state is updated
            await new Promise(resolve => setTimeout(resolve, 50));

            return {
                success: true,
                message: 'Login successful',
                needsAccountSetup: !accountsCheck
            };
        } catch (error) {
            console.error('Login error:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response,
                request: error.request,
                code: error.code
            });

            // Better error handling for different error types
            if (error.response) {
                // Server responded with an error status
                return {
                    success: false,
                    message: error.response.data?.message || 'Login failed. Please try again.'
                };
            } else if (error.request) {
                // Request was made but no response received
                return {
                    success: false,
                    message: 'Cannot connect to server. Please check your internet connection.'
                };
            } else if (error.code === 'ECONNABORTED') {
                // Request timeout
                return {
                    success: false,
                    message: 'Request timeout. Please try again.'
                };
            } else {
                // Something else happened
                return {
                    success: false,
                    message: error.message || 'An unexpected error occurred. Please try again.'
                };
            }
        } finally {
            setLoading(false);
            setIsLoggingIn(false);
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout', {}, { timeout: 5000 });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            updateAuthHeaders(null);
            setUser(null);
            setHasAccounts(false);
            queryClient.clear();
            setLoading(false);
        }
    };

    const register = async (name, email, password, confirmPassword) => {
        try {
            const response = await api.post('/register', {
                name,
                email,
                password,
                password_confirmation: confirmPassword
            }, {
                validateStatus: () => true,
                timeout: 10000
            });

            if (response.status === 201 || response.status === 200) {
                return {
                    success: true,
                    data: response.data || 'Registration successful. Please check your email.'
                };
            } else if (response.status === 422) {
                console.log("Validation errors:", response.data?.errors);
                return {
                    success: false,
                    error: response.data?.message || 'Validation failed',
                    errors: response.data?.errors
                };
            } else {
                console.log("Unexpected error:", response.data);
                return {
                    success: false,
                    error: response.data?.message || 'Registration failed',
                    errors: response.data?.errors
                };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.message || 'Network error during registration'
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
            setUser,
            isLoggingIn
        }}>
            {children}
        </AuthContext.Provider>
    );
};