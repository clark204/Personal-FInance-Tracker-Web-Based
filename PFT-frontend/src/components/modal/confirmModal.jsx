import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmModal({ show, text, onSubmit, onClose }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ y: 30, scale: 0.95, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        exit={{ y: 20, scale: 0.95, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 22 }}
                        className="bg-gradient-to-b from-slate-900 to-slate-800 text-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8"
                    >
                        <div className="text-center space-y-4">
                            <h2 className="text-xl sm:text-2xl font-semibold text-emerald-400">
                                Confirm Action
                            </h2>
                            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                                {text}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
                            <button
                                onClick={onClose}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-sm sm:text-base font-medium transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onSubmit}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[var(--color-expense)] hover:bg-[var(--color-expense)]/80 text-sm sm:text-base font-semibold transition-all duration-200"
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
