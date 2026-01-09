import React from 'react';
import { Trash2, Clock, Check, TrendingDown, Plus, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../utils/finance';

const MortgageEditor = ({ mortgage, updateMortgage, removeMortgage, addRepayment, updateRepayment, removeRepayment, portfolioData }) => {

    // Calculate single mortgage stats on the fly
    const singleData = portfolioData.breakdown[mortgage.id] || [];
    const totalInterest = singleData.reduce((sum, d) => sum + d.interest, 0);
    const totalPrincipal = singleData.reduce((sum, d) => sum + d.principal, 0);
    const totalGross = totalInterest + totalPrincipal;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Wijzig {mortgage.name}</h2>
                <button onClick={() => removeMortgage(mortgage.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg flex items-center text-sm transition-colors">
                    <Trash2 className="w-4 h-4 mr-1" /> Verwijder Hypotheekdeel
                </button>
            </div>

            {/* Main Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Naam / Label</label>
                    <input
                        type="text"
                        value={mortgage.name}
                        onChange={(e) => updateMortgage(mortgage.id, 'name', e.target.value)}
                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hypotheekvorm</label>
                    <select
                        value={mortgage.type}
                        onChange={(e) => updateMortgage(mortgage.id, 'type', e.target.value)}
                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                    >
                        <option value="annuity">Annuïteit</option>
                        <option value="linear">Lineair</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Startdatum</label>
                    <input
                        type="date"
                        value={mortgage.startDate}
                        onChange={(e) => updateMortgage(mortgage.id, 'startDate', e.target.value)}
                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hoofdsom (€)</label>
                    <input
                        type="number"
                        value={mortgage.amount}
                        onChange={(e) => updateMortgage(mortgage.id, 'amount', Number(e.target.value))}
                        step="1000"
                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Looptijd (Jaren)</label>
                    <input
                        type="number"
                        value={mortgage.durationYears}
                        onChange={(e) => updateMortgage(mortgage.id, 'durationYears', Number(e.target.value))}
                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                    />
                </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                    <h3 className="text-sm font-semibold flex items-center mb-1" style={{ color: COLORS.uiPrimary }}>
                        <Clock className="w-4 h-4 mr-1" /> Rente Instellingen
                    </h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Start Rente (%)</label>
                    <input
                        type="number"
                        value={mortgage.rate}
                        onChange={(e) => updateMortgage(mortgage.id, 'rate', Number(e.target.value))}
                        step="0.01"
                        className="block w-full rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Rentevaste Periode (Jaren)</label>
                    <input
                        type="number"
                        value={mortgage.fixedPeriodYears}
                        onChange={(e) => updateMortgage(mortgage.id, 'fixedPeriodYears', Number(e.target.value))}
                        className="block w-full rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-blue-700 mb-1">Verwachte rente na vaste periode (%)</label>
                    <input
                        type="number"
                        value={mortgage.rateAfterFixed}
                        onChange={(e) => updateMortgage(mortgage.id, 'rateAfterFixed', Number(e.target.value))}
                        step="0.01"
                        className="block w-full rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                    />
                    <p className="text-xs mt-1" style={{ color: COLORS.uiPrimary }}>
                        Indien de rente wijzigt, wordt het termijnbedrag automatisch herrekend.
                    </p>
                </div>
            </div>

            {/* Extra Repayments Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                        <TrendingDown className="w-5 h-5 mr-2 text-emerald-600" /> Extra Aflossingen
                    </h3>
                    <button onClick={() => addRepayment(mortgage.id)} className="text-sm hover:text-blue-800 font-medium flex items-center" style={{ color: COLORS.uiPrimary }}>
                        <Plus className="w-4 h-4 mr-1" /> Toevoegen
                    </button>
                </div>

                {mortgage.extraRepayments.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        Nog geen extra aflossingen toegevoegd.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {mortgage.extraRepayments.map((rep, idx) => (
                            <div key={rep.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <span className="text-slate-400 font-mono text-xs w-6">#{idx + 1}</span>
                                <div className="flex-1">
                                    <label className="block text-xs text-slate-500 mb-1">Datum</label>
                                    <input
                                        type="date"
                                        value={rep.date}
                                        onChange={(e) => updateRepayment(mortgage.id, rep.id, 'date', e.target.value)}
                                        className="block w-full text-sm rounded border-slate-300 py-1"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs text-slate-500 mb-1">Bedrag (€)</label>
                                    <input
                                        type="number"
                                        value={rep.amount}
                                        onChange={(e) => updateRepayment(mortgage.id, rep.id, 'amount', Number(e.target.value))}
                                        className="block w-full text-sm rounded border-slate-300 py-1"
                                    />
                                </div>
                                <button onClick={() => removeRepayment(mortgage.id, rep.id)} className="mt-4 text-slate-400 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Per-Mortgage Performance Dashboard */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-8">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center mb-6">
                    <BarChart2 className="w-5 h-5 mr-2" style={{ color: COLORS.uiSecondary }} />
                    Prognose: {mortgage.name}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase font-semibold">Totaal Bruto Kosten</p>
                        <p className="text-xl font-bold text-slate-800">€{Math.round(totalGross).toLocaleString('nl-NL')}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                        <p className="text-xs uppercase font-semibold" style={{ color: COLORS.interest }}>Totaal Rente</p>
                        <p className="text-xl font-bold" style={{ color: COLORS.interest }}>€{Math.round(totalInterest).toLocaleString('nl-NL')}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-xs uppercase font-semibold" style={{ color: COLORS.repayment }}>Totaal Aflossing</p>
                        <p className="text-xl font-bold" style={{ color: COLORS.repayment }}>€{Math.round(totalPrincipal).toLocaleString('nl-NL')}</p>
                    </div>
                </div>

                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={singleData}
                            margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="gradRepaymentSingle" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.repayment} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={COLORS.repayment} stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="gradInterestSingle" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.interest} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={COLORS.interest} stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" hide={false} tick={{ fontSize: 10 }} minTickGap={50} />
                            <YAxis tickFormatter={(val) => `€${val}`} tick={{ fontSize: 10 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => `€${Math.round(value).toLocaleString('nl-NL')}`}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="principal" name="Aflossing" stackId="1" stroke={COLORS.repayment} fill="url(#gradRepaymentSingle)" />
                            <Area type="monotone" dataKey="interest" name="Rente" stackId="1" stroke={COLORS.interest} fill="url(#gradInterestSingle)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default MortgageEditor;
