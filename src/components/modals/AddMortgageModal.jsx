
import React from 'react';
import { X, Wand2, FilePlus2, Calculator } from 'lucide-react';

const AddMortgageModal = ({ isOpen, onClose, onSelectExisting, onSelectWizard }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-800">Nieuw Hypotheekdeel Toevoegen</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <p className="text-slate-600 mb-8 text-center text-sm sm:text-base">
                        Wat voor hypotheekdeel wil je toevoegen?
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Option 1: Existing Part */}
                        <button
                            onClick={onSelectExisting}
                            className="flex flex-col items-center p-6 border-2 border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all group text-center"
                        >
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FilePlus2 className="w-6 h-6" />
                            </div>
                            <h4 className="font-semibold text-slate-900 mb-2">Bestaand Deel Overnemen</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Voeg handmatig een bestaand contract toe. Ideaal voor het overzetten van data.
                            </p>
                        </button>

                        {/* Option 2: New Wizard */}
                        <button
                            onClick={onSelectWizard}
                            className="flex flex-col items-center p-6 border-2 border-purple-100 rounded-xl hover:border-purple-500 hover:bg-purple-50/50 transition-all group text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">
                                NIEUW
                            </div>
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Wand2 className="w-6 h-6" />
                            </div>
                            <h4 className="font-semibold text-slate-900 mb-2">Nieuw Deel Berekenen</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Gebruik de <strong>Hypotheek Wizard</strong> om looptijden en risico's te vergelijken.
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddMortgageModal;
