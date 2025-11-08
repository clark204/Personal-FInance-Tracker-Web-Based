import { motion } from "framer-motion";

export default function VerifyModal({ show, onClose, email }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-lg shadow-xl max-w-sm text-center relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                >
                    ✕
                </button>
                <h3 className="text-xl font-semibold mb-3 text-main">Verify Your Email</h3>
                <p className="text-gray-600 mb-4">
                    A verification link has been sent to{" "}
                    <strong>{email}</strong>.
                    <br />
                    Please check your inbox and click the link to verify your account.
                </p>
            </motion.div>
        </div>
    );
}
