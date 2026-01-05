import { motion } from 'framer-motion';

export default function LoadingScreen({ message = "Loading..." }) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center"
            >
                {/* Animated spinner */}
                <div className="relative mx-auto mb-6">
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                
                {/* Loading message */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {message}
                </h3>
                <p className="text-sm text-gray-600 max-w-xs mx-auto">
                    Please wait while we load your content
                </p>
                
                {/* Optional: Progress dots animation */}
                <div className="flex justify-center mt-4 space-x-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

// Simple spinner for inline use
export function SimpleLoadingSpinner({ size = "md", color = "blue" }) {
    const sizeClasses = {
        sm: "w-8 h-8 border-3",
        md: "w-12 h-12 border-4",
        lg: "w-16 h-16 border-4"
    };
    
    const colorClasses = {
        blue: "border-blue-600 border-t-transparent",
        emerald: "border-emerald-600 border-t-transparent",
        gray: "border-gray-600 border-t-transparent",
        white: "border-white border-t-transparent"
    };
    
    return (
        <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}></div>
    );
}