import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import VerifyModal from "../modal/VerifyModal";

export default function Register() {
    const { register } = useAuth();

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Simple validation
        if (form.password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }
        
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError(null);

        const result = await register(
            form.name,
            form.email,
            form.password,
            form.confirmPassword
        );

        if (!result.success) {
            // Show first error message from backend
            const errorMessage = result.errors 
                ? Object.values(result.errors)[0]?.[0] || "Registration failed"
                : result.message || "Registration failed";
            setError(errorMessage);
        } else {
            setError(null);
            setShowVerificationModal(true);
        }

        setLoading(false);
    };

    const inputBase =
        "w-full px-5 py-2 rounded-md border border-border placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus transition";

    const btnClass =
        "w-full py-3 bg-button text-text-white rounded-md font-semibold hover:bg-hover-button transition disabled:opacity-50";

    const fields = [
        {
            label: "Username",
            id: "name",
            name: "name",
            type: "text",
            placeholder: "Username",
            autoComplete: "username"
        },
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
            placeholder: "Minimum 8 characters",
            autoComplete: "new-password"
        },
        {
            label: "Confirm Password",
            id: "confirmPassword",
            name: "confirmPassword",
            type: "password",
            placeholder: "Confirm Password",
            autoComplete: "new-password"
        }
    ];

    return (
        <motion.div
            key="register"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col justify-center items-center w-full"
        >
            <h2 className="text-3xl font-semibold text-main text-center">Create Account</h2>
            <p className="mb-4 text-text-secondary">
                Use your email for registration
            </p>

            <form onSubmit={handleSubmit} className="space-y-3 w-full" method="POST">
                {fields.map((field) => (
                    <motion.div key={field.id}>
                        <label htmlFor={field.id} className="text-text/80 mb-1">
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
                            disabled={loading}
                        />
                    </motion.div>
                ))}

                {/* Show error message */}
                {error && (
                    <p className="text-red-500 text-sm px-4">{error}</p>
                )}

                <button 
                    type="submit" 
                    className={btnClass} 
                    disabled={loading}
                >
                    {loading ? "Creating Account..." : "Create Account"}
                </button>
            </form>

            {
                <VerifyModal
                    show={showVerificationModal}
                    onClose={() => setShowVerificationModal(false)}
                    email={form.email}
                />
            }
        </motion.div>
    );
}