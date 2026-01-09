import { getTaxData } from '../data/taxRates';

// --- Constants ---
export const MAX_MORTGAGES = 4;
// We can use a default threshold if historical data is missing, but ideally we'd look this up too.
// For now, keeping the 2025 value as a baseline or using a simplified lookup if added to taxRates.
export const BASE_TAX_THRESHOLD = 76817;

export const COLORS = {
    repayment: '#508AB9', // Blue
    interest: '#F2822C',  // Orange
    taxBenefit: '#C2D7C1',// Bright Green
    forfait: '#FDD8DD',   // Red
    uiPrimary: '#508AB9',
    uiSecondary: '#F2822C',
    uiText: '#203223'
};

// --- Helper: Robust Date Math ---
export const parseDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return { year: y, month: m - 1 }; // Month is 0-indexed
};

export const getKeyForOffset = (startYear, startMonth, offsetMonths) => {
    const totalMonths = startMonth + offsetMonths;
    const year = startYear + Math.floor(totalMonths / 12);
    const month = totalMonths % 12;
    // Key format: "YYYY-MM"
    return `${year}-${String(month + 1).padStart(2, '0')}`;
};

export const getDisplayDateForOffset = (startYear, startMonth, offsetMonths) => {
    const totalMonths = startMonth + offsetMonths;
    const year = startYear + Math.floor(totalMonths / 12);
    const month = totalMonths % 12;
    const d = new Date(year, month, 1);
    return d.toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' });
};

export const getCurrentMonthKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const createEmptyMortgage = (index) => ({
    id: generateId(),
    name: `Hypotheekdeel ${index + 1}`,
    type: 'annuity', // 'linear' or 'annuity'
    amount: 200000,
    rate: 3.8, // Initial Rate
    fixedPeriodYears: 10, // Default fixed period
    rateAfterFixed: 4.5, // Expected rate after fixed period
    startDate: new Date().toISOString().split('T')[0],
    durationYears: 30,
    extraRepayments: []
});

// Single month calculation
export const calculateMonthlyData = (balance, monthsLeft, currentAnnualRate, type) => {
    const mRate = currentAnnualRate / 100 / 12;
    let interest = 0;
    let principal = 0;
    let gross = 0;

    if (balance > 0) {
        if (type === 'linear') {
            const linearPrincipal = balance / monthsLeft;
            interest = balance * mRate;
            principal = linearPrincipal;
            gross = principal + interest;
        } else {
            // Annuity
            if (mRate === 0) {
                principal = balance / monthsLeft;
                gross = principal;
            } else {
                gross = balance * (mRate * Math.pow(1 + mRate, monthsLeft)) / (Math.pow(1 + mRate, monthsLeft) - 1);
                interest = balance * mRate;
                principal = gross - interest;
            }
        }
    }

    return { interest, principal, gross };
};
