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
    const queryClient = useQueryClient();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
            setUser(JSON.parse(user));
        }
        setLoading(false);
    }, []);

    const checkAuth = async () => {
        try {
            const response = await api.get('/me');
            const authenticatedUser = response.data;
            setUser(authenticatedUser);

            localStorage.setItem('user', JSON.stringify(authenticatedUser));
        } catch (error) {
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await api.post('/login', { email, password }, { validateStatus: () => true });
    
        if (response.status === 401 || response.status === 403) {
            return { success: false, message: response.data.message || 'Invalid email or password' };
        }
    
        if (response.status === 422) {
            return {
                success: false,
                message: response.data.message || 'Validation failed',
                errors: response.data.errors,
            };
        }
    
        if (response.status !== 200 && response.status !== 201) {
            console.error("Unexpected response:", response);
            return {
                success: false,
                message: response.data.message || 'Something went wrong',
            };
        }
    
        const { user, authorization } = response.data;
    
        if (!authorization || !authorization.token) {
            return { success: false, message: 'Missing authorization data in response' };
        }
    
        localStorage.setItem('token', authorization.token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
    
        return { success: true, message: 'Login successful' };
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
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth, register }}>
            {children}
        </AuthContext.Provider>
    );
}


