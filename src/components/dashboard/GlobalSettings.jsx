import React from 'react';
import { Calculator, Euro } from 'lucide-react';

const GlobalSettings = ({
    income, setIncome,
    wozValue, setWozValue,
    includeEwf, setIncludeEwf,
    simulatePhaseOut, setSimulatePhaseOut,
    phaseOutEndYear, setPhaseOutEndYear
}) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-slate-500" /> Fiscale Instellingen
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Bruto Jaarinkomen</label>
                    <div className="relative">
                        <Euro className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="number"
                            value={income}
                            onChange={(e) => setIncome(Number(e.target.value))}
                            className="pl-10 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Totale WOZ-Waarde</label>
                    <div className="relative">
                        <Euro className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="number"
                            value={wozValue}
                            onChange={(e) => setWozValue(Number(e.target.value))}
                            className="pl-10 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
                        />
                    </div>
                </div>
                <div className="space-y-3 pt-1">
                    <div className="flex items-center">
                        <input
                            id="ewf-toggle"
                            type="checkbox"
                            checked={includeEwf}
                            onChange={(e) => setIncludeEwf(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="ewf-toggle" className="ml-2 block text-xs text-slate-700">
                            Eigenwoningforfait meenemen?
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="phaseout-toggle"
                            type="checkbox"
                            checked={simulatePhaseOut}
                            onChange={(e) => setSimulatePhaseOut(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="phaseout-toggle" className="ml-2 block text-xs text-slate-700">
                            Simuleer HRA afbouw naar 0%?
                        </label>
                    </div>

                    {simulatePhaseOut && (
                        <div className="flex items-center pl-6">
                            <span className="text-xs text-slate-500 mr-2">Eindjaar:</span>
                            <input
                                type="number"
                                value={phaseOutEndYear}
                                onChange={(e) => setPhaseOutEndYear(Number(e.target.value))}
                                className="w-20 text-xs rounded border-slate-300 py-1"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalSettings;
