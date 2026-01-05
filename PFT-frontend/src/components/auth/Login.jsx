import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
        if (success) setSuccess(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        const result = await login(form.email, form.password);

        if (!result.success) {
            // Check if this is an email verification error
            if (result.message?.includes('Email not verified')) {
                setSuccess('A new verification email has been sent to your email address.');
            } else {
                setError(result.message || "Invalid credentials");
            }
            setIsSubmitting(false);
        } else {
            setError(null);
            setSuccess(null);
            
            // Wait a bit longer to ensure auth state is fully updated
            setTimeout(() => {
                if (result.needsAccountSetup) {
                    navigate("/dashboard/create-account");
                } else {
                    navigate("/dashboard");
                }
            }, 300);
            
            // Don't set isSubmitting to false here since we're navigating away
        }
    };

    const inputBase =
        "w-full px-5 py-2 rounded-md border border-border placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus transition";

    const btnClass =
        "w-full py-3 bg-button text-white rounded-md font-semibold hover:bg-hover-button transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

    const fields = [
        { 
            label: "Email", 
            id: "email", 
            name: "email", 
            type: "email", 
            placeholder: "Email",
            autoComplete: "email"
        },
        { 
            label: "Password", 
            id: "password", 
            name: "password", 
            type: "password", 
            placeholder: "Password",
            autoComplete: "current-password"
        }
    ];

    return (
        <motion.div
            key="login"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col justify-center items-center w-full"
        >
            <h2 className="text-3xl font-semibold text-main text-center">Sign In</h2>
            <p className="mb-4 text-text-secondary">Sign into your account</p>

            <form onSubmit={handleSubmit} className="space-y-3 w-full" method="POST">
                {fields.map((field) => (
                    <motion.div key={field.id}>
                        <label htmlFor={field.id} className="text-text/80 mb-1 block">
                            {field.label}
                        </label>
                        <input
                            id={field.id}
                            name={field.name}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={form[field.name]}
                            onChange={handleChange}
                            required
                            className={inputBase}
                            autoComplete={field.autoComplete}
                            disabled={isSubmitting}
                        />
                    </motion.div>
                ))}

                {/* Show success message (for email verification) */}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md"
                    >
                        <p className="text-sm">{success}</p>
                    </motion.div>
                )}

                {/* Show error message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md"
                    >
                        <p className="text-sm">{error}</p>
                    </motion.div>
                )}

                <div className="flex justify-between items-center">
                    <div className=""></div>
                    <button
                        type="button"
                        className="text-sm text-button hover:text-hover-button font-medium transition cursor-pointer disabled:opacity-50"
                        onClick={() => alert("Redirect to forgot password flow")}
                        disabled={isSubmitting}
                    >
                        Forgot password?
                    </button>
                </div>

                <button 
                    type="submit" 
                    className={btnClass} 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Signing in...</span>
                        </>
                    ) : (
                        "Login"
                    )}
                </button>
            </form>
        </motion.div>
    );
}