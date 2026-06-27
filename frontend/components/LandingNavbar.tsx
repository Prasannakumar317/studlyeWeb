import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const LandingNavbar: React.FC = () => {
    const navigate = useNavigate();

    const handleContactClick = () => {
        const contactSection = document.getElementById('enquiry-form');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate('/');
            // Wait for navigation and then scroll
            setTimeout(() => {
                const element = document.getElementById('enquiry-form');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 300);
        }
    };

    return (
        <div className="absolute top-0 left-0 right-0 z-[100] px-4 py-4 sm:px-8 sm:py-5 flex items-center justify-between pointer-events-none">
            {/* Logo */}
            <div
                className="cursor-pointer tracking-tight pointer-events-auto bg-white/95 backdrop-blur-md px-4 py-2 sm:px-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]"
                onClick={() => navigate('/')}
            >
                <img src="/images-optimized/studlyf_secondary.webp" alt="STUDLYF" className="h-8 sm:h-12 object-contain" />
            </div>

            {/* Navigation menu - Right side */}
            <div className="flex items-center gap-3 sm:gap-6 pointer-events-auto">
                {/* 📚 Startup Resources - Premium Pill Button */}
                <motion.button
                    whileHover={{ 
                        y: -3,
                        boxShadow: '0 8px 25px -5px rgba(124, 58, 237, 0.5), 0 0 15px rgba(99, 102, 241, 0.4)',
                        filter: 'brightness(1.05)'
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/startup-resources')}
                    className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#4F46E5] border border-white/20 shadow-md backdrop-blur-md transition-all cursor-pointer relative overflow-hidden group"
                >
                    {/* Glow effect on hover */}
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                    
                    <BookOpen size={16} className="text-purple-100" />
                    <span>Startup Resources</span>
                </motion.button>

                {/* About Link */}
                <button
                    onClick={() => navigate('/about')}
                    className="text-xs sm:text-sm font-bold text-gray-700 hover:text-[#7C3AED] transition-colors bg-white/80 hover:bg-white border border-gray-100 hover:border-gray-200 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full backdrop-blur-sm cursor-pointer shadow-sm"
                >
                    About
                </button>

                {/* Contact Link */}
                <button
                    onClick={handleContactClick}
                    className="text-xs sm:text-sm font-bold text-gray-700 hover:text-[#7C3AED] transition-colors bg-white/80 hover:bg-white border border-gray-100 hover:border-gray-200 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full backdrop-blur-sm cursor-pointer shadow-sm"
                >
                    Contact
                </button>

                {/* Login Button */}
                <motion.button
                    whileHover={{ backgroundColor: '#7C3AED', color: '#ffffff', borderColor: '#7C3AED' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-full border border-gray-300 text-xs sm:text-sm font-bold text-gray-900 transition-all bg-white cursor-pointer shadow-sm"
                >
                    Login
                </motion.button>
            </div>
        </div>
    );
};

export default LandingNavbar;
