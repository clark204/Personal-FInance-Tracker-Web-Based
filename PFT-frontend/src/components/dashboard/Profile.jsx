import React from "react";
import {
    User,
    Mail,
    Edit,
    CheckCircle,
    Calendar,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAccount } from "../../hooks/account";

export default function Profile() {
    const { user } = useAuth();
    const { getAccounts } = useAccount();
    const accounts = getAccounts.data?.account || [];
    
    const formatDate = (dateString) => {
        if (!dateString) return "2025";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };
    
    const userSince = formatDate(user?.created_at || "2025-11-01");

    return (
        <div className="overflow-y-auto bg-gradient-to-br from-primary-gradient to-secondary-gradient p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Modern Header */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-main to-main-light rounded-2xl p-6 md:p-8 text-white">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Profile Settings</h1>
                        <p className="text-white/90">Manage your account information and preferences</p>
                    </div>
                </div>

                {/* Personal Information Card - Only Content */}
                <div className="bg-white rounded-2xl shadow-lg border border-color-border overflow-hidden">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-main/5 to-main-light/5 border-b border-color-border/30 p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-main to-main-light rounded-xl">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-color-text">Personal Information</h2>
                                    <p className="text-sm text-color-text-secondary">Your profile details</p>
                                </div>
                            </div>
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-button text-white font-semibold rounded-lg hover:bg-hover-button transition-colors">
                                <Edit className="w-4 h-4" />
                                Edit Profile
                            </button>
                        </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="p-6">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-main to-main-light flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full border-4 border-white outline">
                                    <Edit className="w-4 h-4 text-color-text" />
                                </div>
                            </div>
                            
                            <div className="space-y-6 flex-1">
                                {/* Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold text-color-text-secondary uppercase tracking-wider">Full Name</label>
                                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-color-border/30">
                                            <p className="text-lg font-semibold text-color-text">{user?.name || "Not set"}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold text-color-text-secondary uppercase tracking-wider">Email Address</label>
                                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-color-border/30 flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-color-text-secondary" />
                                            <p className="text-lg font-semibold text-color-text">{user?.email || "No email"}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Status Badges */}
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                                        <CheckCircle className="w-4 h-4" />
                                        Verified Account
                                    </span>
                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                        <Calendar className="w-4 h-4" />
                                        Since {userSince}
                                    </span>
                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                                        <User className="w-4 h-4" />
                                        {accounts.length} Account{accounts.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}