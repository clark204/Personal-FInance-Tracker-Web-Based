import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });


    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await register(
            form.name,
            form.email,
            form.password,
            form.confirmPassword
        );

        if (!result.success) {
            console.log("Error:", result.error)
            setErrors({
                name: result.errors?.name?.[0] || "",
                email: result.errors?.email?.[0] || "",
                password: result.errors?.password?.[0] || "",
                confirmPassword: result.errors?.password_confirmation?.[0] || ""
            });
        } else {
            setErrors({});
            navigate("/auth?mode=login");
        }

        setLoading(false);
    };


    const inputBase =
        "w-full px-5 py-2 rounded-md border border-border placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus transition";

    const btnClass =
        "w-full py-3 bg-button text-text-white rounded-md font-semibold hover:bg-hover-button transition";

    // Configuration for each form field
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
            placeholder: "Password",
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
            className="flex flex-col justify-center items-center"
        >
            <h2 className="text-3xl font-semibold text-main text-center">Create Account</h2>
            <p className="mb-4 text-text-secondary">
                use your email for registration:
            </p>

            <form onSubmit={handleSubmit} className="space-y-3" method="POST">
                {fields.map((field) => (
                    <motion.div
                        key={field.id}
                        animate={errors[field.name] ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }}
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
                            onChange={(e) => {
                                handleChange(e);
                                // Clear error on change
                                setErrors(prev => ({ ...prev, [field.name]: "" }));
                            }}
                            required
                            className={`${inputBase} ${errors[field.name] ? "border-red-500" : ""}`}
                            autoComplete={field.autoComplete}
                        />
                        {errors[field.name] && (
                            <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                        )}
                    </motion.div>
                ))}


                <button type="submit" className={btnClass} disabled={loading}>
                    {loading ? "Signing Up..." : "Sign Up"}
                </button>
            </form>
        </motion.div>
    );
}
