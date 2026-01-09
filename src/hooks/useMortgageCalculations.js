import { useMemo } from 'react';
import {
    parseDate, getKeyForOffset, getDisplayDateForOffset, getCurrentMonthKey,
    calculateMonthlyData, BASE_TAX_THRESHOLD
} from '../utils/finance';
import { getTaxData } from '../data/taxRates';

// Constants mostly for fallback or if not present in taxRates
const HIGH_TAX_RATE = 49.50;

export const useMortgageCalculations = (mortgages, income, wozValue, includeEwf, simulatePhaseOut, phaseOutEndYear) => {

    return useMemo(() => {
        if (mortgages.length === 0) return { schedule: [], stats: {}, breakdown: {}, stackedData: [] };

        // 1. Determine Timeline Boundaries
        // Sort logic to find earliest start date
        const sortedMortgages = [...mortgages].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        const earliestStart = sortedMortgages[0]?.startDate ? sortedMortgages[0].startDate : new Date().toISOString();
        const { year: globalStartYear, month: globalStartMonth } = parseDate(earliestStart);

        // 30 Year Rule Cutoff
        const taxCutoffOffset = 30 * 12; // 360 months from start
        const taxCutoffDisplay = getDisplayDateForOffset(globalStartYear, globalStartMonth, taxCutoffOffset);

        // Find Max End Date
        let maxOffset = 0;
        mortgages.forEach(m => {
            const mStart = parseDate(m.startDate);
            const startOffset = (mStart.year - globalStartYear) * 12 + (mStart.month - globalStartMonth);
            const durationMonths = m.durationYears * 12;
            if (startOffset + durationMonths > maxOffset) {
                maxOffset = startOffset + durationMonths;
            }
        });

        // 2. Pre-Calculate Individual Schedules
        const mortgageSchedules = mortgages.map(m => {
            const mMonths = m.durationYears * 12;
            const { year: mStartYear, month: mStartMonth } = parseDate(m.startDate);
            const fixedMonths = (m.fixedPeriodYears || 10) * 12;

            let balance = m.amount;
            const dataPoints = {};

            for (let i = 0; i < mMonths; i++) {
                const dateKey = getKeyForOffset(mStartYear, mStartMonth, i);

                const currentAnnualRate = i < fixedMonths ? m.rate : (m.rateAfterFixed || m.rate);

                const repaymentsThisMonth = m.extraRepayments.filter(r => r.date.startsWith(dateKey));
                const totalRepayment = repaymentsThisMonth.reduce((sum, r) => sum + Number(r.amount), 0);

                // Subtract repayment BEFORE interest calculation? 
                // Original code: balance -= totalRepayment; if (balance < 0) ...
                // Then calculate interest on remaining balance.
                balance -= totalRepayment;
                if (balance < 0) balance = 0;

                const monthsLeft = mMonths - i;
                const { interest, principal, gross } = calculateMonthlyData(balance, monthsLeft, currentAnnualRate, m.type);

                dataPoints[dateKey] = {
                    interest,
                    principal,
                    gross,
                    balance: balance - principal,
                    extraRepayment: totalRepayment
                };

                balance -= principal;
                if (balance < 0.01) balance = 0;
            }
            return { id: m.id, data: dataPoints };
        });

        // 3. Merge into Master Timeline & Stacked Data
        const schedule = [];
        const stackedData = [];
        const breakdown = {};
        mortgages.forEach(m => breakdown[m.id] = []);

        let cumulativeInterest = 0;
        const nowKey = getCurrentMonthKey();
        let currentStats = null;
        const currentYear = new Date().getFullYear();

        for (let i = 0; i <= maxOffset; i++) {
            const dateKey = getKeyForOffset(globalStartYear, globalStartMonth, i);
            const dateLabel = getDisplayDateForOffset(globalStartYear, globalStartMonth, i);

            // Determine Year for Tax Logic
            const loopTotalMonths = globalStartMonth + i;
            const loopYear = globalStartYear + Math.floor(loopTotalMonths / 12);

            // --- DYNAMIC TAX DATA LOOKUP ---
            const taxData = getTaxData(loopYear);
            let effectiveDeductionRate = taxData.deductionRate;
            const ewfRateForYear = taxData.ewfRate;
            const wetHillenFactor = taxData.wetHillenFactor; // 1.0 = 100% deduction

            // Phase Out Logic Override (if manually enabled)
            if (simulatePhaseOut && loopYear >= currentYear) {
                if (loopYear >= phaseOutEndYear) {
                    effectiveDeductionRate = 0;
                } else {
                    const totalYears = phaseOutEndYear - currentYear;
                    const yearsPassed = loopYear - currentYear;
                    const reductionFactor = Math.max(0, 1 - (yearsPassed / totalYears));
                    effectiveDeductionRate = TAX_RATES.MAX_DEDUCTION_RATES[loopYear] * reductionFactor; // Use base rate * reduction? Or hardcoded 37% * reduction?
                    // Actually, best to just scale whatever the rate WOULD be.
                    // Simplified:
                    effectiveDeductionRate = effectiveDeductionRate * reductionFactor;
                }
            }
            const deductionRateDecimal = effectiveDeductionRate / 100;

            // Marginal Rate for EWF tax addition
            // If income > threshold, we pay 49.5% on the added EWF amount.
            // Threshold is dynamic too ideally, but using constant for now.
            const marginalTaxRate = income > BASE_TAX_THRESHOLD ? HIGH_TAX_RATE : effectiveDeductionRate; // Use deduction rate as lower bound approximation
            const ewfTaxRateDecimal = marginalTaxRate / 100;

            // Calculate Monthly Forfait Cost (Global)
            // EWF = WOZ * Rate
            // Wet Hillen: If Mortgage Interest < EWF, the difference is deductible (pre-2019 fully, then phasing out).
            // But here we calculate cost.
            // EWF Amount added to income = WOZ * Rate
            // Tax on EWF = (WOZ * Rate) * TaxRate
            const annualEwfAmount = wozValue * ewfRateForYear;
            const monthlyEwfAmount = annualEwfAmount / 12;

            // We'll calculate Wet Hillen correction AFTER summing interest.

            let monthlyTotalGross = 0;
            let monthlyTotalInterest = 0;
            let monthlyTotalPrincipal = 0;
            let monthlyTotalBalance = 0;
            let monthlyTotalExtraRepayment = 0;

            const currentMonthParts = [];
            const stackPoint = { date: dateLabel, dateKey };

            mortgageSchedules.forEach(ms => {
                const point = ms.data[dateKey] || { gross: 0, interest: 0, principal: 0, balance: 0, extraRepayment: 0 };

                monthlyTotalGross += point.gross;
                monthlyTotalInterest += point.interest;
                monthlyTotalPrincipal += point.principal;
                monthlyTotalBalance += point.balance;
                monthlyTotalExtraRepayment += point.extraRepayment;

                currentMonthParts.push({ id: ms.id, ...point });

                // Add to stack point for detailed graph
                stackPoint[`${ms.id}_principal`] = point.principal;
                stackPoint[`${ms.id}_interest`] = point.interest;
            });

            // --- Apply 30 Year Rule ---
            const isTaxDeductible = i <= taxCutoffOffset;
            const deductibleInterest = isTaxDeductible ? monthlyTotalInterest : 0;

            // --- Wet Hillen Logic ---
            // If deductible interest < EWF, we have a "positive balance".
            // Hillen Deduction = (EWF - Interest) * HillenFactor.
            // Taxable EWF = EWF - Hillen Deduction.
            // If Interest > EWF, Taxable EWF = EWF.
            // And we deduct Interest fully.

            let taxableEwf = monthlyEwfAmount;
            if (deductibleInterest < monthlyEwfAmount) {
                const hillenDeduction = (monthlyEwfAmount - deductibleInterest) * wetHillenFactor;
                taxableEwf = monthlyEwfAmount - hillenDeduction;
            }

            // Cost of EWF = TaxableEwf * TaxRate
            // BUT: If Interest > EWF, we just add EWF to income and deduct Interest.
            // Net Tax Effect = (EWF * TaxRate) - (Interest * DeductionRate).

            // Let's stick to original structure: EWF Cost vs Tax Benefit.
            // EWF Cost = TaxableEWF * TaxRate
            const monthlyEwfCost = includeEwf ? (taxableEwf * ewfTaxRateDecimal) : 0;

            // Gross HRA Benefit (Money you get back)
            const grossTaxBenefit = deductibleInterest * deductionRateDecimal;

            // Net Calculation
            const monthlyTotalNet = monthlyTotalGross - grossTaxBenefit + monthlyEwfCost;

            cumulativeInterest += monthlyTotalInterest;

            // Add tax/forfait to stack point
            stackPoint['forfait'] = monthlyEwfCost;
            stackPoint['taxBenefit'] = -grossTaxBenefit; // Negative for chart

            // --- Distribute for breakdown view ---
            currentMonthParts.forEach(part => {
                let partTaxBenefit = 0;
                let partForfaitCost = 0;

                if (monthlyTotalInterest > 0) {
                    partTaxBenefit = grossTaxBenefit * (part.interest / monthlyTotalInterest);
                }
                if (monthlyTotalGross > 0) {
                    partForfaitCost = monthlyEwfCost * (part.gross / monthlyTotalGross);
                }

                if (part.balance > 1 || part.gross > 1) {
                    breakdown[part.id].push({
                        date: dateLabel,
                        gross: part.gross,
                        principal: part.principal,
                        interest: part.interest,
                        taxBenefit: -partTaxBenefit,
                        forfait: partForfaitCost,
                        balance: part.balance
                    });
                }
            });

            if (monthlyTotalBalance > 1 || monthlyTotalGross > 1 || monthlyTotalExtraRepayment > 0) {
                const rowData = {
                    date: dateLabel,
                    dateKey: dateKey,
                    gross: monthlyTotalGross,
                    net: monthlyTotalNet,
                    interest: monthlyTotalInterest,
                    principal: monthlyTotalPrincipal,
                    balance: monthlyTotalBalance,
                    extraRepayment: monthlyTotalExtraRepayment,
                    grossTaxBenefit: grossTaxBenefit,
                    ewfCost: monthlyEwfCost,
                    isDeductible: isTaxDeductible,
                    deductionRateUsed: effectiveDeductionRate
                };
                schedule.push(rowData);
                stackedData.push(stackPoint);

                if (dateKey === nowKey) {
                    currentStats = rowData;
                }
            }
        }



        return {
            schedule,
            stackedData,
            breakdown,
            taxCutoffLabel: taxCutoffDisplay,
            stats: {
                totalInterest: cumulativeInterest,
                startNet: schedule.length > 0 ? schedule[0].net : 0,
                endNet: schedule.length > 0 ? schedule[schedule.length - 1].net : 0,
                currentNet: currentStats ? currentStats.net : 0
            }
        };

    }, [mortgages, income, wozValue, includeEwf, simulatePhaseOut, phaseOutEndYear]);
};
