import React, { useState } from 'react';
import { Calculator, ChevronRight, TrendingUp, TrendingDown, CheckCircle2, Calendar, Info } from 'lucide-react';
import { useMortgageCalculations } from '../../hooks/useMortgageCalculations';
import BreakdownChart from '../dashboard/BreakdownChart';

const STEPS = {
    CAPACITY: 1,
    RATES: 2,
    ANALYSIS: 3,
    SUMMARY: 4
};

const MortgageWizard = ({
    onFinish, onCancel,
    currentMortgages = [], totalIncome = 0, wozValue = 0, includeEwf = true, simulatePhaseOut = false, phaseOutEndYear = 2035
}) => {
    const [step, setStep] = useState(STEPS.CAPACITY);

    // Form State
    const [capacity, setCapacity] = useState({
        amount: 300000,
        startDate: new Date().toISOString().slice(0, 7) // YYYY-MM
    });

    const [rates, setRates] = useState({
        fixed5: '3.6',
        fixed10: '3.9',
        fixed20: '4.2',
        fixed30: ''
    });

    // Selection now includes both period and strategy
    const [selectedOption, setSelectedOption] = useState({
        period: 10,
        strategy: 'annuity'
    });

    // --- Step Navigation ---
    const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    // --- Renderers ---
    const renderStepIndicator = () => (
        <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`h-2 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-purple-600' : s < step ? 'w-2 bg-purple-600' : 'w-2 bg-slate-200'}`} />
                ))}
            </div>
        </div>
    );

    const renderCapacityStep = () => (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Hoeveel wil je lenen?</h3>
                <p className="text-slate-500 text-sm">We gebruiken dit om je maandlasten te berekenen.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Benodigd Hypotheekbedrag</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                        <input
                            type="number"
                            className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-lg"
                            value={capacity.amount}
                            onChange={e => setCapacity({ ...capacity, amount: Number(e.target.value) })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gewenste Startdatum</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="month"
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-lg text-slate-700"
                            value={capacity.startDate}
                            onChange={e => setCapacity({ ...capacity, startDate: e.target.value })}
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Looptijd (30 jaar) start vanaf deze datum.</p>
                </div>
            </div>
        </div>
    );

    const handleRateChange = (period, value) => {
        // Allow comma or dot, normalize to dot for internal format check
        // We store exactly what user types if it's valid partial number to allow "3,"
        const normalized = value.replace(',', '.');
        if (value === '' || /^\d*[.,]?\d*$/.test(value)) {
            setRates(prev => ({ ...prev, [`fixed${period}`]: value }));
        }
    };

    const getRateValue = (period) => {
        // Helper to get float for calcs
        return parseFloat(rates[`fixed${period}`].replace(',', '.')) || 0;
    };

    const renderRatesStep = () => (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Marktrentes</h3>
                <p className="text-slate-500 text-sm">Vul de actuele rentes in (gebruik komma of punt).</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {[5, 10, 20, 30].map(period => (
                    <div key={period} className="flex items-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex-1">
                            <span className="font-semibold text-slate-700">{period} Jaar Vast</span>
                        </div>
                        <div className="relative w-32">
                            <input
                                type="text"
                                inputMode="decimal"
                                className="w-full pr-8 pl-3 py-2 border border-slate-300 rounded-md text-right font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                                value={rates[`fixed${period}`]}
                                onChange={e => handleRateChange(period, e.target.value)}
                                placeholder="4,0"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-xs flex items-start">
                <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <p>Deze rentes worden gebruikt om de scenario's en risico's in de volgende stap te berekenen.</p>
            </div>
        </div>
    );

    // --- Logic Helpers ---
    const calculateMonthlyStart = (principal, rate, type) => {
        const r = rate / 100 / 12;
        const n = 30 * 12;
        if (r === 0) return principal / n;

        if (type === 'linear') {
            const repayment = principal / n;
            const interest = principal * r;
            return repayment + interest;
        }
        // Annuity default
        return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    };

    const calculateTotalCost = (principal, initialRate, fixedYears, futureRate, type) => {
        const nTotal = 30 * 12;
        const nFixed = fixedYears * 12;
        const r1 = initialRate / 100 / 12;

        // --- Phase 1: Fixed Period ---
        let paidFixed = 0;
        let balance = principal;

        // For accurate Linear/Annuity sum, we iterate (simplest robust way for mixed rates)
        // or use formulas. Iteration is cheap for 360 months.
        for (let m = 1; m <= nFixed; m++) {
            let interest = balance * r1;
            let repayment = 0;
            let annuity = 0;

            if (type === 'linear') {
                repayment = principal / nTotal; // Fixed repayment part
            } else {
                // Annuity: Recalculate based on remaining term to keep strictly annuity?
                // Or standard annuity formula based on original 30y?
                // Standard: Annuity is fixed based on T=0.
                const T_annuity = principal * (r1 * Math.pow(1 + r1, nTotal)) / (Math.pow(1 + r1, nTotal) - 1);
                annuity = T_annuity;
                repayment = annuity - interest;
            }

            paidFixed += (interest + repayment);
            balance -= repayment;
        }

        const balanceAfterFixed = balance;
        const monthlyStart = calculateMonthlyStart(principal, initialRate, type);

        // --- Phase 2: Future Period ---
        let paidFuture = 0;
        const r2 = futureRate / 100 / 12;
        const nRemaining = nTotal - nFixed;

        if (balance > 0 && nRemaining > 0) {
            // New annuity/linear schedule for remaining debt
            // Note: In NL, usually if rate changes, annuity is recalculated for remaining period to fully repay.
            for (let m = 1; m <= nRemaining; m++) {
                let interest = balance * r2;
                let repayment = 0;

                if (type === 'linear') {
                    // Start principle / 360 is the repayment... 
                    // Actually, if linear, the repayment part stays (Principal / 360) regardless of rate?
                    // Yes, linear repayment is constant.
                    repayment = principal / nTotal;
                } else {
                    // Recalculate annuity for remaining period
                    const annuity = balanceAfterFixed * (r2 * Math.pow(1 + r2, nRemaining)) / (Math.pow(1 + r2, nRemaining) - 1);
                    repayment = annuity - interest;
                }

                paidFuture += (interest + repayment);
                balance -= repayment;
            }
        }

        // Future Monthly is the *first* month of the new period
        let monthlyFuture = 0;
        if (balanceAfterFixed > 0 && nRemaining > 0) {
            let interest = balanceAfterFixed * r2;
            if (type === 'linear') {
                monthlyFuture = (principal / nTotal) + interest;
            } else {
                monthlyFuture = balanceAfterFixed * (r2 * Math.pow(1 + r2, nRemaining)) / (Math.pow(1 + r2, nRemaining) - 1);
            }
        }

        return {
            total: paidFixed + paidFuture,
            monthlyStart,
            monthlyFuture
        };
    };

    // "Break Even": What future rate makes the total cost equal to the target benchmark?
    const findBreakEvenRate = (targetTotalCost, principal, initialRate, fixedYears, type) => {
        // Binary Search for Rate (Uncapped: 0% to 100%)
        let low = 0, high = 50; // Realistically < 50%
        let bestGuess = 0;

        for (let i = 0; i < 30; i++) { // 30 iterations is plenty for precision
            let mid = (low + high) / 2;
            const res = calculateTotalCost(principal, initialRate, fixedYears, mid, type);

            if (res.total > targetTotalCost) high = mid;
            else {
                low = mid;
                bestGuess = mid;
            }
        }
        return bestGuess;
    };

    const [analysisSettings, setAnalysisSettings] = useState({
        strategy: 'annuity', // Filter for table
        view: 'net',         // Calculation mode for Graph/Totals
    });

    // --- Simulation Hook ---
    // We construct a candidate mortgage based on the current SELECTION
    // to feed into the calculation hook for the Graph/Total display.
    const candidateMortgage = {
        id: 'candidate-new',
        name: 'Nieuw Deel',
        type: selectedOption.strategy,
        amount: capacity.amount,
        rate: parseFloat(rates[`fixed${selectedOption.period}`]?.replace(',', '.') || 0),
        fixedPeriodYears: selectedOption.period,
        durationYears: 30,
        startDate: `${capacity.startDate}-01`, // YYYY-MM -> YYYY-MM-DD
        extraRepayments: []
    };

    // Merge current + candidate
    const simulatedMortgages = [...currentMortgages, candidateMortgage];

    // Calculate full scenario
    const simulatedData = useMortgageCalculations(
        simulatedMortgages, totalIncome, wozValue, includeEwf, simulatePhaseOut, phaseOutEndYear
    );

    const renderAnalysisStep = () => {
        // Filter available periods
        const availablePeriods = [5, 10, 20, 30].filter(p => rates[`fixed${p}`] !== '' && parseFloat(rates[`fixed${p}`]) > 0);

        // Filter by Strategy Toggle
        const currentStrategy = analysisSettings.strategy;

        // Benchmarks for Break-Even (vs longest available of SAME strategy)
        const benchmarkPeriod = Math.max(...availablePeriods);
        const benchmarkRate = getRateValue(benchmarkPeriod);
        const benchmarkTotal = calculateTotalCost(capacity.amount, benchmarkRate, benchmarkPeriod, benchmarkRate, currentStrategy).total;

        // Get current month stats from simulation
        // The simulation runs from the *earliest* mortgage start date. 
        // We want to show the First Month of the NEW Mortgage? Or the Current Month?
        // User wants "Total Combined Monthly Cost". Usually "Next Month" relative to Now.
        const todayKey = new Date().toISOString().slice(0, 7);
        // Find data for today (or candidate start date if in future)
        const startKey = capacity.startDate > todayKey ? capacity.startDate : todayKey;
        const currentMonthData = (simulatedData.monthlyData && simulatedData.monthlyData[startKey]) || { totalNet: 0, totalGross: 0 };

        const monthlyCost = analysisSettings.view === 'net' ? currentMonthData.totalNet : currentMonthData.totalGross;

        // Helper to estimate Net for the TABLE preview (approximate)
        const getDisplayAmount = (gross, interest) => {
            if (analysisSettings.view === 'gross') return gross;
            // Rough estimation for table preview: 37% deduction on interest
            const taxBenefit = interest * 0.3693;
            return gross - taxBenefit;
        };

        return (
            <div className="space-y-6 animate-in slide-in-from-right duration-300 h-full flex flex-col">
                <div className="text-center mb-4 flex-shrink-0">
                    <h3 className="text-xl font-bold text-slate-800">Diepte Analyse</h3>
                    <p className="text-slate-500 text-sm">Financiële impact & Risico's</p>
                </div>

                {/* --- Toggles --- */}
                <div className="flex justify-center gap-4 mb-4 flex-shrink-0">
                    {/* Strategy Toggle */}
                    <div className="bg-slate-100 p-1 rounded-lg flex text-sm font-medium">
                        <button
                            onClick={() => {
                                setAnalysisSettings(prev => ({ ...prev, strategy: 'annuity' }));
                                setSelectedOption(prev => ({ ...prev, strategy: 'annuity' }));
                            }}
                            className={`px-4 py-1.5 rounded-md transition-all ${analysisSettings.strategy === 'annuity' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Annuïtair
                        </button>
                        <button
                            onClick={() => {
                                setAnalysisSettings(prev => ({ ...prev, strategy: 'linear' }));
                                setSelectedOption(prev => ({ ...prev, strategy: 'linear' }));
                            }}
                            className={`px-4 py-1.5 rounded-md transition-all ${analysisSettings.strategy === 'linear' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Lineair
                        </button>
                    </div>

                    {/* View Toggle */}
                    <div className="bg-slate-100 p-1 rounded-lg flex text-sm font-medium">
                        <button
                            onClick={() => setAnalysisSettings(prev => ({ ...prev, view: 'gross' }))}
                            className={`px-4 py-1.5 rounded-md transition-all ${analysisSettings.view === 'gross' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Bruto
                        </button>
                        <button
                            onClick={() => setAnalysisSettings(prev => ({ ...prev, view: 'net' }))}
                            className={`px-4 py-1.5 rounded-md transition-all ${analysisSettings.view === 'net' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Netto
                        </button>
                    </div>
                </div>

                {/* --- Main Grid: Table & Graph --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">

                    {/* Left: Interactive Table */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
                        <div className="p-3 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 flex justify-between items-center">
                            <span>Kies Looptijd ({currentStrategy === 'annuity' ? 'Ann.' : 'Lin.'})</span>
                            <div className="text-right">
                                <div className={`text-xs font-normal px-2 py-0.5 rounded ${analysisSettings.view === 'net' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
                                    {analysisSettings.view === 'net' ? 'Netto Maandlasten' : 'Bruto Maandlasten'}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                    Huidig: €{Math.round(analysisSettings.view === 'net' ? simulatedData.stats.currentNet : simulatedData.stats.currentGross || 0).toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-500 sticky top-0 font-medium">
                                    <tr>
                                        <th className="p-2 w-16">Jaren</th>
                                        <th className="p-2 w-16">Rente</th>
                                        <th className="p-2">Nieuw</th>
                                        <th className="p-2 font-bold">Totaal</th>
                                        <th className="p-2 text-slate-400">Rente Risico</th>
                                        <th className="p-2 text-center border-l border-slate-200">vs 10j</th>
                                        <th className="p-2 text-center">vs 20j</th>
                                        <th className="p-2 text-center">vs 30j</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {availablePeriods.map(period => {
                                        const rate = getRateValue(period);
                                        const startVals = calculateTotalCost(capacity.amount, rate, period, rate, currentStrategy);

                                        // Monthly Costs
                                        const r = rate / 100 / 12;
                                        const monthlyGross = startVals.monthlyStart;
                                        const interest = capacity.amount * r;
                                        const displayNew = getDisplayAmount(monthlyGross, interest);

                                        // Generate row for selection logic
                                        const isSelected = selectedOption.period === period && selectedOption.strategy === currentStrategy;

                                        // Get "New" amount for the selected option to subtract if needed
                                        const selectedRate = getRateValue(selectedOption.period);
                                        const selectedStartVals = calculateTotalCost(capacity.amount, selectedRate, selectedOption.period, selectedRate, currentStrategy);
                                        const selectedGross = selectedStartVals.monthlyStart;
                                        const selectedInterest = capacity.amount * (selectedRate / 100 / 12);
                                        const selectedNewDisplay = getDisplayAmount(selectedGross, selectedInterest);

                                        let rowTotalDisplay = 0;
                                        const currentCombinedTotal = analysisSettings.view === 'net' ? currentMonthData.totalNet : currentMonthData.totalGross;
                                        if (isSelected) {
                                            rowTotalDisplay = currentCombinedTotal;
                                        } else {
                                            // Approx: Remove selected, add this row
                                            rowTotalDisplay = currentCombinedTotal - selectedNewDisplay + displayNew;
                                        }


                                        // Risk Calculation
                                        const deltaUp = Math.max(2.0, rate * 0.25);
                                        const deltaDown = Math.max(1.0, rate * 0.25);

                                        const ratePessimistic = rate + deltaUp;
                                        const rateOptimistic = Math.max(0, rate - deltaDown);

                                        const scenPessimistic = calculateTotalCost(capacity.amount, rate, period, ratePessimistic, currentStrategy);
                                        const scenOptimistic = calculateTotalCost(capacity.amount, rate, period, rateOptimistic, currentStrategy);

                                        // We want to show the future monthly payment in these scenarios
                                        // For display, we align with the current view (Gross/Net approx)
                                        // But risk is fundamentally about the Gross rate change usually. 
                                        // However, user sees "Net" in the table, so risk should probably scale?
                                        // Let's stick to the consistent getDisplayAmount wrapper.

                                        // Pessimistic
                                        const pessInterest = capacity.amount * (ratePessimistic / 100 / 12);
                                        const pessDisplay = getDisplayAmount(scenPessimistic.monthlyFuture, pessInterest);

                                        // Optimistic
                                        const optInterest = capacity.amount * (rateOptimistic / 100 / 12);
                                        const optDisplay = getDisplayAmount(scenOptimistic.monthlyFuture, optInterest);


                                        // Break Even Logic
                                        const renderBreakEven = (benchPeriod) => {
                                            if (period >= benchPeriod) return <span className="text-slate-300">-</span>;

                                            // We need Total Cost over Benchmark Period for THIS row vs Benchmark Row.
                                            // This requires `calculateTotalCost` for both.
                                            // Row Total:
                                            const rowTotal = calculateTotalCost(capacity.amount, rate, period, rate, currentStrategy).total;

                                            // Benchmark Total:
                                            const benchRate = getRateValue(benchPeriod);
                                            // If benchmark rate missing, skip?
                                            if (!rates[`fixed${benchPeriod}`]) return <span className="text-slate-200">-</span>;

                                            const benchTotal = calculateTotalCost(capacity.amount, benchRate, benchPeriod, benchRate, currentStrategy).total;

                                            const beRate = findBreakEvenRate(benchTotal, capacity.amount, rate, period, currentStrategy);

                                            if (!beRate) return <span className="text-slate-300">-</span>;

                                            return (
                                                <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${beRate > 10 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {beRate > 20 ? '>20%' : beRate.toFixed(1) + '%'}
                                                </span>
                                            );
                                        };

                                        return (
                                            <tr
                                                key={period}
                                                className={`cursor-pointer transition-colors ${isSelected ? 'bg-purple-50 ring-1 ring-purple-200 inset-ring' : 'hover:bg-slate-50'}`}
                                                onClick={() => setSelectedOption({ period, strategy: currentStrategy })}
                                            >
                                                <td className="p-2 font-semibold text-slate-900 border-b border-slate-50">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            checked={isSelected}
                                                            onChange={() => { }}
                                                            className="accent-purple-600"
                                                        />
                                                        {period}j
                                                    </div>
                                                </td>
                                                <td className="p-2 text-slate-500 border-b border-slate-50">{rate}%</td>
                                                <td className="p-2 font-mono text-slate-600 border-b border-slate-50">€{Math.round(displayNew)}</td>
                                                <td className={`p-2 font-mono font-bold border-b border-slate-50 ${analysisSettings.view === 'net' ? 'text-blue-700' : 'text-slate-700'}`}>
                                                    €{Math.round(rowTotalDisplay)}
                                                </td>
                                                <td className="p-1 border-b border-slate-50">
                                                    <div className="flex flex-col gap-0.5 text-[10px] font-mono">
                                                        <div className="text-green-600 flex items-center justify-between bg-green-50 px-1.5 py-0.5 rounded">
                                                            <span><TrendingDown className="w-3 h-3 inline mr-1" />€{Math.round(optDisplay)}</span>
                                                            <span className="opacity-70 ml-2">{rateOptimistic.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="text-red-600 flex items-center justify-between bg-red-50 px-1.5 py-0.5 rounded">
                                                            <span><TrendingUp className="w-3 h-3 inline mr-1" />€{Math.round(pessDisplay)}</span>
                                                            <span className="opacity-70 ml-2">{ratePessimistic.toFixed(1)}%</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-2 text-center border-l border-slate-100 border-b border-slate-50">{renderBreakEven(10)}</td>
                                                <td className="p-2 text-center border-b border-slate-50">{renderBreakEven(20)}</td>
                                                <td className="p-2 text-center border-b border-slate-50">{renderBreakEven(30)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right: Graph & Totals */}
                    <div className="flex flex-col gap-4 min-h-0 h-full">
                        {/* Removed Summary Card - Integrated into Table & Header */}

                        {/* Graph */}
                        <div className="bg-white p-1 rounded-xl border border-slate-200 flex-1 min-h-[300px] h-[300px] relative flex flex-col w-full">
                            <div className="absolute top-2 left-3 z-10 text-xs font-bold text-slate-500 bg-white/80 px-2 py-1 rounded backdrop-blur border border-slate-100 shadow-sm">
                                Verloop Maandlasten (Totaal)
                            </div>
                            <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
                                <BreakdownChart
                                    portfolioData={simulatedData}
                                    mortgages={simulatedMortgages}
                                    viewMode={analysisSettings.view}
                                    showTheoretic={false} // Clean view
                                    includeEwf={includeEwf}
                                    markers={(() => {
                                        const parts = candidateMortgage.startDate.split('-');
                                        const year = parseInt(parts[0]) + candidateMortgage.fixedPeriodYears;
                                        const targetKey = `${year}-${parts[1]}`;
                                        // Find the formatted label that matches the chart's X-axis
                                        const matchingRow = simulatedData.schedule?.find(r => r.dateKey === targetKey);

                                        if (matchingRow) {
                                            return [{
                                                date: matchingRow.date,
                                                label: `Einde ${candidateMortgage.fixedPeriodYears}j`,
                                                color: '#ef4444'
                                            }];
                                        }
                                        return [];
                                    })()}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSummaryStep = () => (
        <div className="space-y-6 animate-in slide-in-from-right duration-300 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-slate-800">Klaar om toe te voegen!</h3>
            <p className="text-slate-500">Je hebt het volgende hypotheekdeel samengesteld:</p>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 max-w-sm mx-auto text-left space-y-3">
                <div className="flex justify-between">
                    <span className="text-slate-500">Bedrag</span>
                    <span className="font-bold text-slate-900">€{capacity.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Rente</span>
                    <span className="font-bold text-slate-900">{rates[`fixed${selectedOption.period}`]}%</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Rentevaste Periode</span>
                    <span className="font-bold text-slate-900">{selectedOption.period} Jaar</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Vorm</span>
                    <span className="font-bold text-slate-900 capitalize">{selectedOption.strategy === 'annuity' ? 'Annuïtair' : 'Lineair'}</span>
                </div>
            </div>

            <p className="text-xs text-slate-400">
                Je kunt details later altijd nog aanpassen in het dashboard.
            </p>
        </div>
    );

    const handleFinish = () => {
        const mortgageConfig = {
            amount: capacity.amount,
            rate: rates[`fixed${selectedOption.period}`],
            fixedPeriod: selectedOption.period,
            duration: 30, // Default to 30y
            type: selectedOption.strategy,
            startDate: `${capacity.startDate}-01`
        };
        onFinish(mortgageConfig);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] min-h-[600px] flex flex-col overflow-hidden transition-all">
                {/* Header */}
                <div className="bg-white p-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center space-x-2 text-purple-600">
                        <Calculator className="w-5 h-5" />
                        <span className="font-bold tracking-tight">Hypotheek Wizard</span>
                    </div>
                    <button onClick={onCancel} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                {/* Progress */}
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                    {renderStepIndicator()}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-8 overflow-y-auto relative no-scrollbar">
                    {step === STEPS.CAPACITY && renderCapacityStep()}
                    {step === STEPS.RATES && renderRatesStep()}
                    {step === STEPS.ANALYSIS && renderAnalysisStep()}
                    {step === STEPS.SUMMARY && renderSummaryStep()}
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
                    <button
                        onClick={step === 1 ? onCancel : prevStep}
                        className="px-6 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                    >
                        {step === 1 ? 'Annuleren' : 'Terug'}
                    </button>

                    <button
                        onClick={step === STEPS.SUMMARY ? handleFinish : nextStep}
                        className="px-8 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-md shadow-purple-200 transition-all flex items-center"
                    >
                        {step === STEPS.SUMMARY ? 'Toevoegen' : 'Volgende'}
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MortgageWizard;
