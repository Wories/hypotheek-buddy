// Historical Tax Data for The Netherlands (1995-2025)
// Sources: Belastingdienst, CBS, Government Archives

export const TAX_RATES = {
    // Box 1 Income Tax Brackets (Simplified to max deductible rates for HRA context)
    // For HRA (Mortgage Interest Deduction), the relevant part is often the max deduction rate,
    // which started differing from the top bracket rate in 2014.
    MAX_DEDUCTION_RATES: {
        1995: 60.00, 1996: 60.00, 1997: 60.00, 1998: 60.00, 1999: 60.00,
        2000: 60.00, 2001: 52.00, 2002: 52.00, 2003: 52.00, 2004: 52.00,
        2005: 52.00, 2006: 52.00, 2007: 52.00, 2008: 52.00, 2009: 52.00,
        2010: 52.00, 2011: 52.00, 2012: 52.00, 2013: 52.00,
        // Phase out starts (-0.5% per year)
        2014: 51.50, 2015: 51.00, 2016: 50.50, 2017: 50.00, 2018: 49.50, 2019: 49.00,
        // Accelerated phase out
        2020: 46.00,
        2021: 43.00,
        2022: 40.00,
        2023: 36.93,
        2024: 36.97,
        2025: 37.48
    },

    // Eigenwoningforfait (EWF) - Standard Rate for average homes
    // Note: There are thresholds (villataks), but we use the standard middle rate for simplicity unless comprehensive logic is added.
    EWF_RATES: {
        2000: 0.0060, // 0.60% (Approx)
        2001: 0.0080, 2002: 0.0080, 2003: 0.0080, 2004: 0.0080, 2005: 0.0085,
        2006: 0.0065, 2007: 0.0055, 2008: 0.0055, 2009: 0.0055, 2010: 0.0055,
        2011: 0.0055, 2012: 0.0060, 2013: 0.0060, 2014: 0.0070, 2015: 0.0075,
        2016: 0.0075, 2017: 0.0075, 2018: 0.0070, 2019: 0.0065, 2020: 0.0060,
        2021: 0.0050, 2022: 0.0045, 2023: 0.0035, 2024: 0.0035, 2025: 0.0035
    },

    // Wet Hillen Phase-out Factors (% of net EWF that is deductible if no mortgage)
    // 100% means fully deductible (paying 0 tax).
    WET_HILLEN_FACTORS: {
        // Before 2019: 100%
        2018: 1.00,
        2019: 0.9667,
        2020: 0.9333,
        2021: 0.9000,
        2022: 0.8667,
        2023: 0.8333,
        2024: 0.8000,
        2025: 0.7667,
        2026: 0.7182, // Accelerated
        2027: 0.6698, // Est accelerated
        2028: 0.6213,
        2029: 0.5729,
        2030: 0.5244
        // Continues...
    }
};

export const getTaxData = (year) => {
    // Fallback / Projections
    const maxYear = 2025;
    const lookupYear = Math.min(year, maxYear);

    return {
        deductionRate: TAX_RATES.MAX_DEDUCTION_RATES[lookupYear] || 37.48,
        ewfRate: TAX_RATES.EWF_RATES[lookupYear] || 0.0035,
        wetHillenFactor: TAX_RATES.WET_HILLEN_FACTORS[year] ?? (year < 2019 ? 1.0 : 0) // Crude fallback for future
    };
};
