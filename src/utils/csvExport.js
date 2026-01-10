export const exportScheduleToCSV = (schedule) => {
    if (!schedule || schedule.length === 0) return;

    // Defines headers
    // Using semicolon for better compatibility with European Excel versions (which use comma as decimal separator)
    const headers = [
        'Datum',
        'Bruto Maandlast',
        'Netto Maandlast',
        'Rente',
        'Aflossing',
        'HRA Voordeel',
        'EWF Kosten',
        'Restschuld'
    ];

    const csvContent = [
        headers.join(';'), // Header row
        ...schedule.map(row => {
            return [
                row.date, // Already formatted string e.g., "jan. 2024"
                row.gross.toFixed(2).replace('.', ','),
                row.net.toFixed(2).replace('.', ','),
                row.interest.toFixed(2).replace('.', ','),
                row.principal.toFixed(2).replace('.', ','),
                row.grossTaxBenefit.toFixed(2).replace('.', ','),
                row.ewfCost.toFixed(2).replace('.', ','),
                row.balance.toFixed(2).replace('.', ',')
            ].join(';');
        })
    ].join('\n');

    // Create a Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'hypotheek_schema.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
