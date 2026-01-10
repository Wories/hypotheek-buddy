import React, { useState } from 'react';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import MortgageEditor from './components/editor/MortgageEditor';
import { createEmptyMortgage, generateId, getKeyForOffset, parseDate, MAX_MORTGAGES } from './utils/finance';
import { useMortgageCalculations } from './hooks/useMortgageCalculations';
import AddMortgageModal from './components/modals/AddMortgageModal';
import MortgageWizard from './components/wizard/MortgageWizard';
import { deserializeState } from './utils/urlSharing';

const App = () => {
  // --- Persistence Helper ---
  const loadSavedData = () => {
    try {
      // 1. Check URL for shared data
      const searchParams = new URLSearchParams(window.location.search);
      const sharedData = searchParams.get('data');
      if (sharedData) {
        const parsed = deserializeState(sharedData);
        if (parsed) {
          // Remove query param to clean URL without refresh
          window.history.replaceState({}, document.title, window.location.pathname);
          return parsed;
        }
      }

      const saved = localStorage.getItem('hypotheekBuddy_data');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to load save data", e);
      return null;
    }
  };

  const savedData = loadSavedData();

  // --- Global Settings ---
  const [incomePartner1, setIncomePartner1] = useState(savedData?.incomePartner1 ?? 60000);
  const [incomePartner2, setIncomePartner2] = useState(savedData?.incomePartner2 ?? 0);
  const totalIncome = incomePartner1 + incomePartner2;

  const [wozValue, setWozValue] = useState(savedData?.wozValue ?? 400000);
  const [includeEwf, setIncludeEwf] = useState(savedData?.includeEwf ?? true);

  // Phase Out Settings
  const [simulatePhaseOut, setSimulatePhaseOut] = useState(savedData?.simulatePhaseOut ?? false);
  const [phaseOutEndYear, setPhaseOutEndYear] = useState(savedData?.phaseOutEndYear ?? 2035);

  // --- Mortgage List State ---
  const [mortgages, setMortgages] = useState(savedData?.mortgages ?? [createEmptyMortgage(0)]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState(savedData?.viewMode ?? 'net'); // 'gross' or 'net'

  // --- Wizard/Modal State ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // --- Auto-Save Effect ---
  React.useEffect(() => {
    const dataToSave = {
      incomePartner1,
      incomePartner2,
      wozValue,
      includeEwf,
      simulatePhaseOut,
      phaseOutEndYear,
      mortgages,
      viewMode
    };
    localStorage.setItem('hypotheekBuddy_data', JSON.stringify(dataToSave));
  }, [incomePartner1, incomePartner2, wozValue, includeEwf, simulatePhaseOut, phaseOutEndYear, mortgages, viewMode]);

  // --- Actions ---
  const addMortgage = (config = null) => {
    if (mortgages.length < MAX_MORTGAGES) {
      const newM = createEmptyMortgage(mortgages.length);

      // Apply wizard config if present
      if (config) {
        newM.amount = config.amount;
        newM.rate = config.rate;
        newM.type = config.type || 'annuity';
        newM.durationYears = config.duration || 30;
        if (config.fixedPeriod) {
          newM.fixedPeriodYears = config.fixedPeriod;
        }
      }

      setMortgages([...mortgages, newM]);
      setActiveTab(newM.id);
    }
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsWizardOpen(false);
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
    mortgages, totalIncome, wozValue, includeEwf, simulatePhaseOut, phaseOutEndYear
  );

  // --- Share Logic ---
  const handleShare = () => {
    const dataToShare = {
      incomePartner1,
      incomePartner2,
      wozValue,
      includeEwf,
      simulatePhaseOut,
      phaseOutEndYear,
      mortgages,
      viewMode
    };

    // Lazy load the serializer to avoid bundle bloat if not used? No, just import top level.
    const { serializeState } = require('./utils/urlSharing');
    const compressed = serializeState(dataToShare);

    if (compressed) {
      const url = `${window.location.origin}${window.location.pathname}?data=${compressed}`;
      navigator.clipboard.writeText(url).then(() => {
        alert('Link gekopieerd naar klembord! 🔗');
      }).catch(err => {
        console.error('Failed to copy: ', err);
        prompt('Kopieer deze link:', url);
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mortgages={mortgages}
        addMortgage={handleAddClick}
        onShare={handleShare}
        MAX_MORTGAGES={MAX_MORTGAGES}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' ? (
          <Dashboard
            incomePartner1={incomePartner1} setIncomePartner1={setIncomePartner1}
            incomePartner2={incomePartner2} setIncomePartner2={setIncomePartner2}
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

      {/* --- Modals --- */}
      <AddMortgageModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addMortgage}
        // Stats/Global Context for Wizard Simulation
        currentMortgages={mortgages}
        totalIncome={totalIncome}
        wozValue={wozValue}
        includeEwf={includeEwf}
        simulatePhaseOut={simulatePhaseOut}
        phaseOutEndYear={phaseOutEndYear}
        onSelectWizard={() => {
          setIsAddModalOpen(false);
          setIsWizardOpen(true);
        }}
      />

      {
        isWizardOpen && (
          <MortgageWizard
            onFinish={(config) => {
              addMortgage(config);
              closeModals();
            }}
            onCancel={closeModals}
            // Stats/Global Context for Wizard Simulation
            currentMortgages={mortgages}
            totalIncome={totalIncome}
            wozValue={wozValue}
            includeEwf={includeEwf}
            simulatePhaseOut={simulatePhaseOut}
            phaseOutEndYear={phaseOutEndYear}
          />
        )
      }
    </div >
  );
};

export default App;
