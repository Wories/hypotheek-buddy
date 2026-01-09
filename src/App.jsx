import React, { useState } from 'react';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import MortgageEditor from './components/editor/MortgageEditor';
import { createEmptyMortgage, generateId, getKeyForOffset, parseDate, MAX_MORTGAGES } from './utils/finance';
import { useMortgageCalculations } from './hooks/useMortgageCalculations';

const App = () => {
  // --- Global Settings ---
  const [income, setIncome] = useState(75000);
  const [wozValue, setWozValue] = useState(400000);
  const [includeEwf, setIncludeEwf] = useState(true);

  // Phase Out Settings
  const [simulatePhaseOut, setSimulatePhaseOut] = useState(false);
  const [phaseOutEndYear, setPhaseOutEndYear] = useState(2035);

  // --- Mortgage List State ---
  const [mortgages, setMortgages] = useState([createEmptyMortgage(0)]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('net'); // 'gross' or 'net'

  // --- Actions ---
  const addMortgage = () => {
    if (mortgages.length < MAX_MORTGAGES) {
      const newM = createEmptyMortgage(mortgages.length);
      setMortgages([...mortgages, newM]);
      setActiveTab(newM.id);
    }
  };

  const removeMortgage = (id) => {
    setMortgages(mortgages.filter(m => m.id !== id));
    setActiveTab('dashboard');
  };

  const updateMortgage = (id, field, value) => {
    setMortgages(mortgages.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addRepayment = (mortgageId) => {
    setMortgages(mortgages.map(m => {
      if (m.id !== mortgageId) return m;
      // Default to 1 year after start
      const s = parseDate(m.startDate);
      const nextYearKey = getKeyForOffset(s.year, s.month, 12);
      return {
        ...m,
        extraRepayments: [...m.extraRepayments, { id: generateId(), date: `${nextYearKey}-01`, amount: 5000 }]
      };
    }));
  };

  const updateRepayment = (mortgageId, repayId, field, value) => {
    setMortgages(mortgages.map(m => {
      if (m.id !== mortgageId) return m;
      return {
        ...m,
        extraRepayments: m.extraRepayments.map(r => r.id === repayId ? { ...r, [field]: value } : r)
      };
    }));
  };

  const removeRepayment = (mortgageId, repayId) => {
    setMortgages(mortgages.map(m => {
      if (m.id !== mortgageId) return m;
      return {
        ...m,
        extraRepayments: m.extraRepayments.filter(r => r.id !== repayId)
      };
    }));
  };

  // --- Calculation Hook ---
  const portfolioData = useMortgageCalculations(
    mortgages, income, wozValue, includeEwf, simulatePhaseOut, phaseOutEndYear
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mortgages={mortgages}
        addMortgage={addMortgage}
        MAX_MORTGAGES={MAX_MORTGAGES}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' ? (
          <Dashboard
            income={income} setIncome={setIncome}
            wozValue={wozValue} setWozValue={setWozValue}
            includeEwf={includeEwf} setIncludeEwf={setIncludeEwf}
            simulatePhaseOut={simulatePhaseOut} setSimulatePhaseOut={setSimulatePhaseOut}
            phaseOutEndYear={phaseOutEndYear} setPhaseOutEndYear={setPhaseOutEndYear}
            mortgages={mortgages}
            portfolioData={portfolioData}
            viewMode={viewMode} setViewMode={setViewMode}
          />
        ) : (
          mortgages.filter(m => m.id === activeTab).map(m => (
            <MortgageEditor
              key={m.id}
              mortgage={m}
              updateMortgage={updateMortgage}
              removeMortgage={removeMortgage}
              addRepayment={addRepayment}
              updateRepayment={updateRepayment}
              removeRepayment={removeRepayment}
              portfolioData={portfolioData}
            />
          ))
        )}
      </main>
    </div>
  );
};

export default App;
