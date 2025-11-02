import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useMediaQuery } from "react-responsive";
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function AuthPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    const [step, setStep] = useState("");
    const isMobile = useMediaQuery({ maxWidth: 768 });

    useEffect(() => {
        const mode = queryParams.get("mode")
        setStep((mode === "register" ? "register" : "login"));
    }, [location.search]);

    const handleSwitch = () => {
        const newStep = step === "login" ? "register" : "login";
        setStep(newStep);
        navigate(`/auth?mode=${newStep}`)
    };

    const handleSuccess = () => {
        window.location.href = "/dashboard";
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-main relative">
            {/* Background gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
            </div>
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B2027]/95 backdrop-blur-sm border-b border-white/10">
                <div className="flex items-center justify-between h-16 px-6 max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="w-10 h-10 bg-[url('/FT.svg')] bg-cover bg-no-repeat bg-center rounded-md shadow-md shadow-icon/30"></div>
                        <span className="text-text-white text-xl font-semibold tracking-wide">
                            Finance<span className="text-icon">Tracker</span>
                        </span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/#home" className="text-text-white/80 hover:text-text-white transition-colors">Home</Link>
                        <Link to="/#features" className="text-text-white/80 hover:text-text-white transition-colors">Features</Link>
                        <Link to="/#about" className="text-text-white/80 hover:text-text-white transition-colors">About</Link>
                        <Link to="/#contact" className="text-text-white/80 hover:text-text-white transition-colors">Contact</Link>
                    </nav>
                </div>
            </header>

            {/* Auth Card */}
            <div
                className={`flex rounded-xl shadow-xl overflow-hidden max-w-4xl w-full min-h-[550px] mt-24
                    ${isMobile ? 'flex-col min-h-auto' : 'flex-row'}
                `}
            >
                {/* Left Panel */}
                <motion.div
                    key="side-panel"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`
                        flex flex-col justify-center items-center 
                        ${isMobile ? 'w-full px-8 py-10 rounded-t-xl' : 'w-1/2 px-14 py-12 rounded-l-xl'}
                        bg-main-light text-text-white relative
                    `}
                >
                    {step === "login" ? (
                        <>
                            <h2 className="text-4xl font-bold mb-4 text-center">Welcome Back!</h2>
                            <p className="mb-6 text-center max-w-xs text-text-white/90">
                                To keep connected with us please login with your personal info
                            </p>
                            <button
                                onClick={handleSwitch}
                                className="border border-text-white rounded-full px-10 py-3 font-semibold hover:bg-text-white hover:text-icon transition"
                            >
                                SIGN UP
                            </button>
                        </>
                    ) : (
                        <>
                            <h2 className="text-4xl font-bold mb-4 text-center">Hello, Friend!</h2>
                            <p className="mb-6 text-center max-w-xs text-text-white/90">
                                Enter your personal details and start your journey with us
                            </p>
                            <button
                                onClick={handleSwitch}
                                className="border border-text-white rounded-full px-10 py-3 font-semibold hover:bg-text-white hover:text-icon transition"
                            >
                                SIGN IN
                            </button>
                        </>
                    )}
                </motion.div>

                {/* Right Panel (Form Area) */}
                <div
                    className={`
                        ${isMobile ? 'w-full p-8 rounded-b-xl' : 'w-1/2 p-12 rounded-tr-xl rounded-br-xl'}
                        bg-primary-gradient shadow-lg flex flex-col justify-center items-center
                    `}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {step === "login" && <Login key="login" onSuccess={handleSuccess} onSwitch={handleSwitch} />}
                        {step === "register" && <Register key="register" onSuccess={handleSuccess} onSwitch={handleSwitch} />}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;
