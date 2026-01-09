import React from 'react';
import { COLORS } from '../../utils/finance';

const StatsOverview = ({ stats, taxCutoffLabel }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50">
                <p className="text-xs uppercase font-semibold" style={{ color: COLORS.uiPrimary }}>Huidig Netto Maandlast</p>
                <p className="text-xl font-bold" style={{ color: COLORS.uiPrimary }}>€{Math.round(stats.currentNet || 0).toLocaleString('nl-NL')}</p>
            </div>
            <div className="p-4 rounded-xl border border-blue-100 bg-slate-50">
                <p className="text-xs uppercase font-semibold text-slate-500">Eind Netto Maandlast</p>
                <p className="text-xl font-bold text-slate-700">€{Math.round(stats.endNet || 0).toLocaleString('nl-NL')}</p>
            </div>
            <div className="p-4 rounded-xl border border-orange-100 bg-orange-50">
                <p className="text-xs uppercase font-semibold" style={{ color: COLORS.interest }}>Totaal Betaalde Rente</p>
                <p className="text-xl font-bold" style={{ color: COLORS.interest }}>€{Math.round(stats.totalInterest || 0).toLocaleString('nl-NL')}</p>
            </div>
            <div className="p-4 rounded-xl border border-green-100 bg-green-50">
                <p className="text-xs uppercase font-semibold" style={{ color: COLORS.uiText }}>HRA Einddatum</p>
                <p className="text-xl font-bold" style={{ color: COLORS.uiText }}>{taxCutoffLabel}</p>
            </div>
        </div>
    );
};

export default StatsOverview;
