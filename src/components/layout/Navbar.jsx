import React, { useState, useEffect, useRef } from 'react';
import { Wallet, Plus, Share2, Check, Copy, Link as LinkIcon } from 'lucide-react';
import { COLORS } from '../../utils/finance';

const Navbar = ({ activeTab, setActiveTab, mortgages, addMortgage, onShare, MAX_MORTGAGES }) => {
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [showCopyFeedback, setShowCopyFeedback] = useState(false);
    const shareRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (shareRef.current && !shareRef.current.contains(event.target)) {
                setIsShareOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleCopyLink = async () => {
        const success = await onShare();
        if (success) {
            setShowCopyFeedback(true);
            setTimeout(() => {
                setShowCopyFeedback(false);
                setIsShareOpen(false);
            }, 2000);
        }
    };

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center shrink-0">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center mr-2 sm:mr-3" style={{ backgroundColor: COLORS.uiPrimary }}>
                            <Wallet className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg sm:text-xl text-slate-900 leading-none hidden sm:block">Hypotheek Buddy</span>
                            <span className="text-[10px] text-slate-500 font-medium hidden md:block">Historische Data & Wet Hillen</span>
                        </div>
                    </div>
                    <div className="flex items-center flex-1 justify-end min-w-0">
                        <div className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar px-2">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                style={{ color: activeTab === 'dashboard' ? COLORS.uiPrimary : undefined, backgroundColor: activeTab === 'dashboard' ? '#f0f9ff' : undefined }}
                                className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors text-slate-500 hover:text-slate-700 whitespace-nowrap`}
                            >
                                Overzicht
                            </button>
                            {mortgages.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setActiveTab(m.id)}
                                    style={{ color: activeTab === m.id ? COLORS.uiPrimary : undefined, backgroundColor: activeTab === m.id ? '#f0f9ff' : undefined }}
                                    className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center text-slate-500 hover:text-slate-700 whitespace-nowrap`}
                                >
                                    <span className="truncate max-w-[60px] sm:max-w-none">{m.name}</span>
                                </button>
                            ))}
                            {mortgages.length < MAX_MORTGAGES && (
                                <button onClick={addMortgage} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full flex-shrink-0" style={{ color: COLORS.uiPrimary }} title="Nieuw Hypotheekdeel">
                                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center shrink-0 ml-2">
                            <div className="border-l border-slate-200 h-5 sm:h-6 mx-1 sm:mx-2"></div>

                            {/* Share Menu */}
                            <div className="relative" ref={shareRef}>
                                <button
                                    onClick={() => setIsShareOpen(!isShareOpen)}
                                    className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 transition-colors ${isShareOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-500 hover:text-blue-500'}`}
                                    title="Delen"
                                >
                                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>

                                {isShareOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 p-1 z-50 transform origin-top-right transition-all">
                                        <button
                                            onClick={handleCopyLink}
                                            className="w-full flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                                        >
                                            {showCopyFeedback ? (
                                                <Check className="h-4 w-4 mr-3 text-green-500 animate-in zoom-in duration-200" />
                                            ) : (
                                                <LinkIcon className="h-4 w-4 mr-3 text-slate-400" />
                                            )}
                                            <span className={showCopyFeedback ? "text-green-600 font-medium" : ""}>
                                                {showCopyFeedback ? "Link gekopieerd!" : "Kopieer link"}
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
