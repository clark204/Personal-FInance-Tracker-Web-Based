import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = await login(form.email, form.password);

        if (!result.success) {
            setError(result.message || "Invalid credentials");
            setLoading(false);
        } else {
            setError(null);
            // If user needs account setup, navigate to create-account
            if (result.needsAccountSetup) {
                navigate("/dashboard/create-account");
            } else {
                navigate("/dashboard");
            }
        }
    };

    const inputBase =
        "w-full px-5 py-2 rounded-md border border-border placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus transition";

    const btnClass =
        "w-full py-3 bg-button text-text-white rounded-md font-semibold hover:bg-hover-button transition disabled:opacity-50";

    const fields = [
        { label: "Email", id: "email", name: "email", type: "email", placeholder: "Email" },
        { label: "Password", id: "password", name: "password", type: "password", placeholder: "Password" }
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

                <div className={`${error ? "flex justify-between" : "text-right"}`}>
                    {error && (
                        <p className="text-red-500 text-sm px-4">{error}</p>
                    )}
                    <button
                        type="button"
                        className="text-sm text-button hover:text-hover-button font-medium transition cursor-pointer disabled:opacity-50"
                        onClick={() => alert("Redirect to forgot password flow")}
                        disabled={loading}
                    >
                        Forgot password?
                    </button>
                </div>

                <button 
                    type="submit" 
                    className={btnClass} 
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </motion.div>
    );
}