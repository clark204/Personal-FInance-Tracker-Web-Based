import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    // handle both string and object errors
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));

        // clear field-specific error when user types
        if (error && typeof error === "object") {
            setError((prev) => ({ ...prev, [e.target.name]: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(form.email, form.password);

        if (!result.success) {
            // handle both string and object responses
            if (typeof result.message === "object") {
                setError(result.message); // Laravel validation errors
            } else {
                setError(result.message || "Login failed");
            }
        } else {
            setError(null);
            navigate("/dashboard");
        }

        setLoading(false);
    };

    const inputBase =
        "w-full px-5 py-2 rounded-md border border-border placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus transition";

    const btnClass =
        "w-full py-3 bg-button text-text-white rounded-md font-semibold hover:bg-hover-button transition";

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

    const getErrorMessage = (fieldName) => {
        if (!error) return "";
        if (typeof error === "string") return error; // general error
        if (error[fieldName]) {
            return Array.isArray(error[fieldName])
                ? error[fieldName][0]
                : error[fieldName];
        }
        return "";
    };

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

            {/* General error (like invalid credentials) */}
            {typeof error === "string" && (
                <p className="text-red-500 text-sm mb-3">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 w-full" method="POST">
                {fields.map((field) => (
                    <motion.div
                        key={field.id}
                        animate={getErrorMessage(field.name)
                            ? { x: [0, -5, 5, -5, 5, 0] }
                            : { x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
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
                            className={`${inputBase} ${getErrorMessage(field.name)
                                ? "border-red-500"
                                : ""
                                }`}
                            autoComplete={field.autoComplete}
                        />
                        {getErrorMessage(field.name) && (
                            <p className="text-red-500 text-sm mt-1">
                                {getErrorMessage(field.name)}
                            </p>
                        )}
                    </motion.div>
                ))}

                <div className="text-right">
                    <button
                        type="button"
                        className="text-sm text-button hover:text-hover-button font-medium transition cursor-pointer"
                        onClick={() => alert("Redirect to forgot password flow")}
                    >
                        Forgot password?
                    </button>
                </div>

                <button type="submit" className={btnClass}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </motion.div>
    );
}
