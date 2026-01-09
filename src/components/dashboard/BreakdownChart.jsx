import React, { useState } from 'react';
import { PieChart, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { COLORS } from '../../utils/finance';

const BreakdownChart = ({ mortgages, portfolioData, viewMode, setViewMode, includeEwf, markers }) => {
    const [breakdownFilter, setBreakdownFilter] = useState('all');

    const BreakdownTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            let totalPrincipal = 0;
            let totalInterest = 0;
            let totalTaxBenefit = 0;
            let totalForfait = 0;

            payload.forEach(p => {
                if (p.dataKey.includes('principal')) totalPrincipal += p.value;
                if (p.dataKey.includes('interest')) totalInterest += p.value;
                if (p.dataKey === 'taxBenefit') totalTaxBenefit += p.value; // Negative value
                if (p.dataKey === 'forfait') totalForfait += p.value;
            });

            const totalGross = totalPrincipal + totalInterest;
            const totalNet = totalGross + totalForfait + totalTaxBenefit;

            return (
                <div className="bg-white p-3 border border-slate-200 shadow-md rounded-lg text-xs z-50">
                    <p className="font-bold text-slate-700 mb-2">{label}</p>
                    <div className="space-y-1">
                        <div className="flex justify-between gap-4" style={{ color: COLORS.repayment }}>
                            <span>Aflossing:</span><span>€{Math.round(totalPrincipal).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between gap-4" style={{ color: COLORS.interest }}>
                            <span>Rente:</span><span>€{Math.round(totalInterest).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between gap-4 font-semibold border-t border-slate-100 pt-1 text-slate-700">
                            <span>Bruto Maandlast:</span><span>€{Math.round(totalGross).toLocaleString('nl-NL')}</span>
                        </div>

                        {viewMode === 'net' && (
                            <>
                                <div className="flex justify-between gap-4 mt-2 border-t border-slate-100 pt-1" style={{ color: COLORS.forfait }}>
                                    <span>EWF Kosten:</span><span>+€{Math.round(totalForfait).toLocaleString('nl-NL')}</span>
                                </div>
                                <div className="flex justify-between gap-4" style={{ color: COLORS.taxBenefit }}>
                                    <span>Belastingvoordeel:</span><span>{Math.round(totalTaxBenefit).toLocaleString('nl-NL')}</span>
                                </div>
                                <div className="flex justify-between gap-4 border-t border-slate-200 pt-1 mt-1 font-bold text-slate-900">
                                    <span>Netto Maandlast:</span><span>€{Math.round(totalNet).toLocaleString('nl-NL')}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-md font-semibold text-slate-700 flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-slate-500" /> Maandlasten Verloop
                </h3>
                <div className="flex flex-wrap gap-2">
                    <div className="bg-slate-100 p-1 rounded-lg flex items-center">
                        <button
                            onClick={() => setViewMode('gross')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'gross' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                        >
                            Bruto
                        </button>
                        <button
                            onClick={() => setViewMode('net')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'net' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                        >
                            Netto
                        </button>
                    </div>
                    <select
                        value={breakdownFilter}
                        onChange={(e) => setBreakdownFilter(e.target.value)}
                        className="text-sm border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-1.5"
                    >
                        <option value="all">Gecombineerd</option>
                        {mortgages.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={breakdownFilter === 'all'
                            ? (portfolioData.stackedData || [])
                            : (portfolioData.breakdown && portfolioData.breakdown[breakdownFilter]) || []
                        }
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="gradRepayment" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.repayment} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={COLORS.repayment} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="gradInterest" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.interest} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={COLORS.interest} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="gradTax" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.taxBenefit} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={COLORS.taxBenefit} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="gradForfait" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.forfait} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={COLORS.forfait} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>

                        <XAxis dataKey="date" hide={false} tick={{ fontSize: 12 }} minTickGap={50} />
                        <YAxis tickFormatter={(val) => `€${Math.abs(val)}`} tick={{ fontSize: 12 }} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <RechartsTooltip content={<BreakdownTooltip />} />
                        <Legend verticalAlign="top" height={36} />

                        {/* --- Stack Construction --- */}

                        {/* 1. REPAYMENT (Blue) - Positive */}
                        {/* --- Stack Construction (Flattened) --- */}
                        {(() => {
                            const layers = [];

                            // 1. REPAYMENT (Blue)
                            if (breakdownFilter === 'all') {
                                mortgages.forEach(m => {
                                    layers.push(
                                        <Area
                                            key={`p_${m.id}`}
                                            type="monotone"
                                            dataKey={`${m.id}_principal`}
                                            name={`Aflossing (${m.name})`}
                                            stackId="positive"
                                            stroke={COLORS.repayment}
                                            fill="url(#gradRepayment)"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                        />
                                    );
                                });
                            } else {
                                layers.push(
                                    <Area key="total_p" type="monotone" dataKey="principal" name="Aflossing" stackId="positive" stroke={COLORS.repayment} fill="url(#gradRepayment)" strokeWidth={2} fillOpacity={1} />
                                );
                            }

                            // 2. INTEREST (Orange)
                            if (breakdownFilter === 'all') {
                                mortgages.forEach(m => {
                                    layers.push(
                                        <Area
                                            key={`i_${m.id}`}
                                            type="monotone"
                                            dataKey={`${m.id}_interest`}
                                            name={`Rente (${m.name})`}
                                            stackId="positive"
                                            stroke={COLORS.interest}
                                            fill="url(#gradInterest)"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                        />
                                    );
                                });
                            } else {
                                layers.push(
                                    <Area key="total_i" type="monotone" dataKey="interest" name="Rente" stackId="positive" stroke={COLORS.interest} fill="url(#gradInterest)" strokeWidth={2} fillOpacity={1} />
                                );
                            }

                            // 3. FORFAIT (Pink)
                            if (viewMode === 'net') {
                                layers.push(
                                    <Area key="forfait" type="monotone" dataKey="forfait" name="EWF Kosten (Belasting)" stackId="positive" stroke={COLORS.forfait} fill="url(#gradForfait)" strokeWidth={2} fillOpacity={1} />
                                );
                            }

                            // 4. TAX BENEFIT (Green)
                            if (viewMode === 'net') {
                                layers.push(
                                    <Area key="taxBenefit" type="monotone" dataKey="taxBenefit" name="Hypotheekrenteaftrek" stackId="negative" stroke={COLORS.taxBenefit} fill="url(#gradTax)" strokeWidth={2} fillOpacity={1} />
                                );
                            }

                            return layers;
                        })()}

                        {/* Optional Reference Lines (Markers) */}
                        {markers && markers.map((marker, i) => (
                            <ReferenceLine
                                key={i}
                                x={marker.date}
                                stroke={marker.color || "#64748b"}
                                strokeDasharray="3 3"
                                label={{ position: 'top', value: marker.label, fill: marker.color || "#64748b", fontSize: 10 }}
                            />
                        ))}

                        <ReferenceLine y={0} stroke="#000" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {includeEwf && (
                <div className="mt-4 bg-orange-50 border border-orange-100 rounded-lg p-3 flex items-start text-xs text-orange-800">
                    <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                        <strong>Waarom zijn Netto lasten hoger dan Bruto aan het einde?</strong>
                        <p className="mt-1 opacity-90">
                            Dit gebeurt wanneer de rentebetalingen erg laag zijn (einde looptijd).
                            Vanwege de <em>Wet Hillen</em> afbouw en het <em>Eigenwoningforfait</em> (belasting op woningbezit), is de bijtelling hoger dan de aftrek, wat zorgt voor een netto belastingpost.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BreakdownChart;
