import React from 'react';
import GlobalSettings from './GlobalSettings';
import BreakdownChart from './BreakdownChart';
import StatsOverview from './StatsOverview';
import PaymentSchedule from './PaymentSchedule';

const Dashboard = ({
    incomePartner1, setIncomePartner1,
    incomePartner2, setIncomePartner2,
    wozValue, setWozValue,
    includeEwf, setIncludeEwf,
    simulatePhaseOut, setSimulatePhaseOut,
    phaseOutEndYear, setPhaseOutEndYear,
    mortgages,
    portfolioData,
    viewMode, setViewMode
}) => {
    return (
        <div className="space-y-6">
            <GlobalSettings
                incomePartner1={incomePartner1} setIncomePartner1={setIncomePartner1}
                incomePartner2={incomePartner2} setIncomePartner2={setIncomePartner2}
                wozValue={wozValue} setWozValue={setWozValue}
                includeEwf={includeEwf} setIncludeEwf={setIncludeEwf}
                simulatePhaseOut={simulatePhaseOut} setSimulatePhaseOut={setSimulatePhaseOut}
                phaseOutEndYear={phaseOutEndYear} setPhaseOutEndYear={setPhaseOutEndYear}
            />

            <BreakdownChart
                mortgages={mortgages}
                portfolioData={portfolioData}
                viewMode={viewMode} setViewMode={setViewMode}
                includeEwf={includeEwf}
            />

            <StatsOverview
                stats={portfolioData.stats}
                taxCutoffLabel={portfolioData.taxCutoffLabel}
            />

            <PaymentSchedule schedule={portfolioData.schedule} />
        </div>
    );
};

export default Dashboard;
