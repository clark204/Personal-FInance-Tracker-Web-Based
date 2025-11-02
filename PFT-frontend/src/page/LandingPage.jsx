import { ArrowLeft, ArrowRight, Award, Bell, Mail, MapPin, Phone, PieChart, Shield, SquareUser, Target, TrendingUp, Users, Wallet } from 'lucide-react';
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function LandingPage() {
    const { hash } = useLocation();

    useEffect(() => {
        if (hash) {
            const el = document.querySelector(hash);
            if (el) el.scrollIntoView({ behavior: "smooth" });
        }
    }, [hash])

    const features = [
        {
            icon: Wallet,
            title: "Expense Tracking",
            description: "Automatically categorize and track all your expenses in real-time. Never lose sight of where your money goes.",
        },
        {
            icon: TrendingUp,
            title: "Budget Planning",
            description: "Set custom budgets for different categories and get alerts when you're approaching your limits.",
        },
        {
            icon: PieChart,
            title: "Financial Analytics",
            description: "Visualize your spending patterns with detailed charts and reports. Make data-driven financial decisions.",
        },
        {
            icon: Bell,
            title: "Smart Notifications",
            description: "Get timely reminders for bills, unusual spending patterns, and opportunities to save more money.",
        },
        {
            icon: Shield,
            title: "Safe Security",
            description: "Your financial data is encrypted. Your privacy is our priority.",
        },
        {
            icon: SquareUser,
            title: "Multi-Account Access",
            description: "Access your finances with accounts. Sync seamlessly across all your accounts.",
        },
    ];

    return (
        <div className="min-h-screen bg-[#0B2027]">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B2027]/95 backdrop-blur-sm border-b border-white/10">
                <div className="flex items-center justify-between h-16 px-6 mx-auto">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[url('/FT.svg')] bg-cover bg-no-repeat bg-center rounded-md shadow-md shadow-emerald-500/20"></div>
                        <span className="text-emerald-300 text-xl font-semibold tracking-wide">
                            Finance<span className="text-emerald-500">Tracker</span>
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#home" className="text-gray-300 hover:text-white transition-colors">
                            Home
                        </a>
                        <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                            Features
                        </a>
                        <a href="#about" className="text-gray-300 hover:text-white transition-colors">
                            About
                        </a>
                        <a href="#contact" className="text-gray-300 hover:text-white transition-colors">
                            Contact
                        </a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link to="/auth?mode=login" className="text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300">
                            Login
                        </Link>
                        <Link to="/auth?mode=register" className="rounded-xl px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-[#0B2027] hover:from-emerald-500 hover:to-teal-600 transition-all duration-300">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main>
                {/* Hero */}
                <section id="home" className="min-h-screen pt-32 pb-20 relative overflow-hidden">
                    {/* Background gradients */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="container mx-auto px-6 relative z-10">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            {/* Left side - Text content */}
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                    <span className="text-emerald-400 text-sm">Smart Financial Management</span>
                                </div>

                                <h1 className="text-5xl md:text-6xl lg:text-7xl text-white leading-tight">
                                    Take Control of Your{" "}
                                    <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                                        Finances
                                    </span>
                                </h1>

                                <p className="text-gray-400 text-lg max-w-xl">
                                    Track expenses, manage budgets, and achieve your financial goals with our intuitive
                                    platform. Get real-time insights and make smarter money decisions.
                                </p>

                                <div className="flex flex-wrap gap-4">
                                    <Link to="/auth?mode=register" className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium bg-gradient-to-r from-emerald-400 to-teal-500 text-[#0B2027] hover:from-emerald-500 hover:to-teal-600 transition-all duration-300">
                                        Get Started
                                        <ArrowLeft className="w-5 h-5" />
                                    </Link >
                                    <a href="#features" className="px-5 py-3 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-300">
                                        Learn More
                                    </a>
                                </div>
                            </div>

                            {/* Right side - Floating bubbles */}
                            <div className="relative h-[600px] hidden md:block">
                                {/* Bubble 1 - Top right */}
                                <div className="absolute top-0 right-0 w-72 h-72 animate-float">
                                    <div className="bg-[url('/bubble1.jpg')] bg-no-repeat bg-cover bg-center w-full h-full rounded-full overflow-hidden border-4 border-emerald-400/30 shadow-2xl shadow-emerald-500/20 hover:scale-105 transition-transform duration-300"></div>
                                </div>

                                {/* Bubble 2 - Middle left */}
                                <div className="absolute top-40 left-0 w-64 h-64 animate-float-delayed">
                                    <div className="bg-[url('/bubble2.jpg')] bg-no-repeat bg-cover bg-center w-full h-full rounded-full overflow-hidden border-4 border-teal-400/30 shadow-2xl shadow-teal-500/20 hover:scale-105 transition-transform duration-300"></div>
                                </div>

                                {/* Bubble 3 - Bottom right */}
                                <div className="absolute bottom-0 right-16 w-56 h-56 animate-float-slow">
                                    <div className="bg-[url('/bubble3.jpg')] bg-no-repeat bg-cover bg-center w-full h-full rounded-full overflow-hidden border-4 border-emerald-500/30 shadow-2xl shadow-emerald-500/20 hover:scale-105 transition-transform duration-300"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Placeholder sections */}
                <section id="features" className="py-24 bg-gradient-to-b from-[#0B2027] to-[#0f2a33]">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-4xl md:text-5xl text-white">
                                Powerful Features for{" "}
                                <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                                    Smart Money Management
                                </span>
                            </h2>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                Everything you need to take control of your finances and build wealth for the future.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={index}
                                        className="rounded-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:border-emerald-500/30 group"
                                    >
                                        <div className="p-8 space-y-4">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <Icon className="w-7 h-7 text-emerald-400" />
                                            </div>
                                            <h3 className="text-xl text-white">{feature.title}</h3>
                                            <p className="text-gray-400 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
                <section id="about" className="py-24 bg-[#0f2a33] relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-1/2 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"></div>

                    <div className="container mx-auto px-6 relative z-10">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            {/* Left side - Content */}
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h2 className="text-4xl md:text-5xl text-white">
                                        About{" "}
                                        <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                                            FinanceTracker
                                        </span>
                                    </h2>
                                    <p className="text-gray-400 text-lg leading-relaxed">
                                        We're on a mission to democratize financial management and empower everyone
                                        to make smarter money decisions. FinanceTracker has helped
                                        thousands of users take control of their finances and achieve their goals.
                                    </p>
                                    <p className="text-gray-400 text-lg leading-relaxed">
                                        Our platform combines powerful analytics with an intuitive interface, making
                                        it easy for anyone to understand their financial health and plan for a better future.
                                    </p>
                                </div>
                            </div>

                            {/* Right side - Stats and values */}
                            <div className="space-y-6">
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 flex items-center justify-center">
                                            <Target className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl text-white mb-2">Our Mission</h3>
                                            <p className="text-gray-400">
                                                To make financial literacy accessible to everyone and help people
                                                build lasting wealth through smart money management.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl text-white mb-2">Our Team</h3>
                                            <p className="text-gray-400">
                                                A diverse group of financial experts, designers, and developers
                                                passionate about creating the best financial tools.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 flex items-center justify-center">
                                            <Award className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl text-white mb-2">Our Values</h3>
                                            <p className="text-gray-400">
                                                Transparency, security, and user empowerment guide everything
                                                we do. Your trust is our greatest achievement.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-[#0B2027] border-t border-white/10 py-16" id='contact'>
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        {/* Company info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="bg-[url('/FT.svg')] bg-center bg-cover w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                                </div>
                                <span className="text-white text-xl">FinanceTracker</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Empowering people to take control of their financial future with smart tools and insights.
                            </p>
                        </div>

                        {/* Product */}
                        <div>
                            <h4 className="text-white mb-4">Product</h4>
                            <ul className="space-y-2">
                                <li><a href="#features" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">Features</a></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="text-white mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li><a href="#about" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">About Us</a></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-white mb-4">Contact</h4>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Mail className="w-4 h-4" />
                                    <span>support@financetracker.com</span>
                                </li>
                                <li className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Phone className="w-4 h-4" />
                                    <span>+63 09354670532</span>
                                </li>
                                <li className="flex items-center gap-2 text-gray-400 text-sm">
                                    <MapPin className="w-4 h-4" />
                                    <span>Philippines</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            © 2025 FinanceTracker. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
                                Privacy Policy
                            </a>
                            <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
                                Terms of Service
                            </a>
                            <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
                                Cookie Policy
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
