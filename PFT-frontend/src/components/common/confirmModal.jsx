import { useState, useEffect, useCallback, memo } from "react";
import { AlertTriangle, CheckCircle, X, Trash2, Info } from "lucide-react";

// Memoize everything that doesn't need to re-render
const ModalIcon = memo(({ config }) => {
    const Icon = config.icon;
    return (
        <div className={`p-2.5 rounded-lg ${config.iconBg} border ${config.borderColor}`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
    );
});

ModalIcon.displayName = 'ModalIcon';

const ActionButton = memo(({ 
    onClick, 
    disabled, 
    children, 
    type = "secondary",
    isLoading = false 
}) => {
    const handleClick = useCallback((e) => {
        if (e) e.preventDefault();
        if (!isLoading && !disabled) {
            onClick();
        }
    }, [onClick, isLoading, disabled]);

    const typeStyles = {
        secondary: "border border-gray-300 text-gray-700 hover:bg-gray-50",
        warning: "bg-amber-500 text-white hover:bg-amber-600",
        danger: "bg-rose-500 text-white hover:bg-rose-600",
        success: "bg-emerald-500 text-white hover:bg-emerald-600",
        info: "bg-blue-500 text-white hover:bg-blue-600"
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled || isLoading}
            className={`px-5 py-3 rounded-xl font-medium transition-colors duration-100 cursor-pointer flex-1 ${typeStyles[type]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {isLoading ? (
                <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                </>
            ) : (
                children
            )}
        </button>
    );
});

ActionButton.displayName = 'ActionButton';

export default function ConfirmModal({ 
    show, 
    text, 
    onSubmit, 
    onClose,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "warning",
    title = "Confirm Action",
    isLoading = false,
    destructive = false
}) {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    // Control visibility with minimal state changes
    useEffect(() => {
        if (show) {
            setShouldRender(true);
            // Use setTimeout to allow DOM to render before animation
            requestAnimationFrame(() => {
                setIsVisible(true);
                // Disable body scroll
                document.body.style.overflow = 'hidden';
            });
        } else {
            setIsVisible(false);
            // Enable body scroll
            document.body.style.overflow = '';
            // Delay unmount for exit animation
            const timer = setTimeout(() => setShouldRender(false), 150);
            return () => clearTimeout(timer);
        }
    }, [show]);

    // Handle ESC key - very simple
    useEffect(() => {
        if (!show) return;
        
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !isLoading) {
                onClose();
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [show, isLoading, onClose]);

    // Simple config - no memo needed, it's cheap
    const config = {
        warning: {
            icon: AlertTriangle,
            iconColor: "text-amber-500",
            iconBg: "bg-amber-50",
            borderColor: "border-amber-200",
            confirmColor: "warning",
            textColor: "text-amber-700",
        },
        danger: {
            icon: Trash2,
            iconColor: "text-rose-500",
            iconBg: "bg-rose-50",
            borderColor: "border-rose-200",
            confirmColor: "danger",
            textColor: "text-rose-700",
        },
        success: {
            icon: CheckCircle,
            iconColor: "text-emerald-500",
            iconBg: "bg-emerald-50",
            borderColor: "border-emerald-200",
            confirmColor: "success",
            textColor: "text-emerald-700",
        },
        info: {
            icon: Info,
            iconColor: "text-blue-500",
            iconBg: "bg-blue-50",
            borderColor: "border-blue-200",
            confirmColor: "info",
            textColor: "text-blue-700",
        }
    };

    const currentConfig = config[type];

    if (!shouldRender) return null;

    return (
        <>
            {/* Simple backdrop - no animations */}
            <div 
                className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-150 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={isLoading ? undefined : onClose}
            />

            {/* Modal container - simple transform animation */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div 
                    className={`relative bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden border border-gray-200 transition-all duration-150 transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                >
                    <div className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <ModalIcon config={currentConfig} />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {title}
                                    </h2>
                                    {(type === 'danger' && destructive) || type === 'warning' ? (
                                        <p className={`text-xs mt-1 ${currentConfig.textColor}`}>
                                            {type === 'danger' && destructive 
                                                ? 'This action cannot be undone' 
                                                : 'Please review before proceeding'}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Close modal"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="mb-6">
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {text}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <ActionButton
                                type="secondary"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                {cancelText}
                            </ActionButton>
                            <ActionButton
                                type={currentConfig.confirmColor}
                                onClick={onSubmit}
                                isLoading={isLoading}
                            >
                                {confirmText}
                            </ActionButton>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}