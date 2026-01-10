import React from 'react';
import { Download } from 'lucide-react';
import { COLORS } from '../../utils/finance';
import { exportScheduleToCSV } from '../../utils/csvExport';

const PaymentSchedule = ({ schedule }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-md font-semibold text-slate-700">Aflosschema</h3>
                <button
                    onClick={() => exportScheduleToCSV(schedule)}
                    className="text-sm px-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:text-purple-600 hover:border-purple-200 transition-colors flex items-center shadow-sm"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV
                </button>
            </div>
            <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-6 py-3">Datum</th>
                            <th className="px-6 py-3">Bruto</th>
                            <th className="px-6 py-3 font-bold" style={{ color: COLORS.uiPrimary, backgroundColor: '#f0f9ff' }}>Netto</th>
                            <th className="px-6 py-3">Rente</th>
                            <th className="px-6 py-3">Aflossing</th>
                            <th className="px-6 py-3">HRA Voordeel</th>
                            <th className="px-6 py-3">EWF Kosten</th>
                            <th className="px-6 py-3">Restschuld</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedule.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-3 font-medium whitespace-nowrap">{row.date}</td>
                                <td className="px-6 py-3">€{Math.round(row.gross).toLocaleString('nl-NL')}</td>
                                <td className="px-6 py-3 font-bold" style={{ color: COLORS.uiPrimary, backgroundColor: '#f0f9ff' }}>€{Math.round(row.net).toLocaleString('nl-NL')}</td>
                                <td className="px-6 py-3 text-slate-500">€{Math.round(row.interest).toLocaleString('nl-NL')}</td>
                                <td className="px-6 py-3 text-slate-500">€{Math.round(row.principal).toLocaleString('nl-NL')}</td>
                                <td className={`px-6 py-3 font-medium`} style={{ color: COLORS.taxBenefit }}>
                                    {`-€${Math.round(row.grossTaxBenefit).toLocaleString('nl-NL')}`}
                                </td>
                                <td className="px-6 py-3 font-medium" style={{ color: COLORS.forfait }}>
                                    {`+€${Math.round(row.ewfCost).toLocaleString('nl-NL')}`}
                                </td>
                                <td className="px-6 py-3">€{Math.round(row.balance).toLocaleString('nl-NL')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentSchedule;
