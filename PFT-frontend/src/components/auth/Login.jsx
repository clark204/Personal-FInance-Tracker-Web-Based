import { motion } from "framer-motion";
import { useState } from "react";

export default function Login({ onSuccess }) {
    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSuccess();
    };

    const inputBase =
        "w-full px-5 py-2 rounded-md border border-border placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus transition";

    const btnClass =
        "w-full py-3 bg-button text-text-white rounded-md font-semibold hover:bg-hover-button transition";

    return (
        <motion.div
            key="login"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col justify-center items-center"
        >
            <h2 className="text-3xl font-semibold text-main text-center">Sign In</h2>
            <p className="mb-4 text-text-secondary">Sign into Your account</p>
            <form onSubmit={handleSubmit} className="space-y-3 w-full max-w-md">
                <label htmlFor="email" className="text-text/80">Email</label>
                <input
                    type="email"
                    placeholder="Email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className={inputBase}
                />
                <label htmlFor="password" className="text-text/80">Password</label>
                <input
                    type="password"
                    placeholder="Password"
                    id="password"
                    name="password"
                    onChange={handleChange}
                    value={form.password}
                    required
                    className={inputBase}
                />
                {/* Forgot password link */}
                <div className="text-right">
                    <button
                        type="button"
                        className="text-sm text-button hover:text-hover-button font-medium transition cursor-pointer"
                        onClick={() => alert("Redirect to forgot password flow")}
                    >
                        Forgot password?
                    </button>
                </div>
                <button type="submit" className={btnClass}>Login</button>
            </form>
        </motion.div>
    );
}
