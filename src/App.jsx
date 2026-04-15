import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, 
  Wallet, 
  User, 
  BarChart2, 
  Menu,
  MessageSquare,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Eye,
  EyeOff,
  Target,
  Zap,
  Wifi,
  MonitorPlay,
  ShieldCheck,
  DollarSign,
  Euro,
  Plus,
  X,
  CheckCircle2,
  Trash2,
  Settings,
  CreditCard,
  LineChart as LineChartIcon,
  Activity,
  Briefcase,
  Landmark,
  Moon,
  Sun,
  CalendarDays,
  AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

// --- Hook Avançado para LocalStorage (Reativo a mudanças de chave) ---
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      } else {
        setStoredValue(initialValue);
      }
    } catch (error) {
      setStoredValue(initialValue);
    }
  }, [key]);

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn("Error setting localStorage", error);
    }
  };

  return [storedValue, setValue];
}

// --- Componente: Contador Animado ---
const AnimatedNumber = ({ value, prefix = "", suffix = "", decimals = 0, isPrivate = false, duration = 1500 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrameId;
    let startTimestamp = null;
    const startValue = displayValue;
    const targetValue = Number(value) || 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = startValue + (targetValue - startValue) * ease;
      setDisplayValue(current);
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValue);
      }
    };
    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  const formatted = displayValue.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  if (isPrivate) return <span>{prefix}••••{suffix}</span>;
  return <span>{prefix}{formatted}{suffix}</span>;
};

// --- Utilitário: Gerador de Meses ---
const generateMonths = () => {
  const months = [];
  const d = new Date();
  for(let i = -12; i <= 12; i++) {
    const date = new Date(d.getFullYear(), d.getMonth() + i, 1);
    const val = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, '0')}`;
    let label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    label = label.charAt(0).toUpperCase() + label.slice(1);
    months.push({ value: val, label: label });
  }
  return months;
};

// --- Dados Iniciais Zerados ---
const initialTransactions = [];
const initialFixedCosts = [];
const initialGoals = [];
const initialCustomInvestments = [];

// Utilitário para renderizar ícones dinamicamente
const IconMap = { Zap, ShieldCheck, Wifi, MonitorPlay, CreditCard, Receipt: CreditCard };
const getIcon = (name) => IconMap[name] || CreditCard;

// --- Estilos Globais Premium ---
const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

  body {
    font-family: 'Outfit', sans-serif;
    font-weight: 300;
    background-color: #f8f9fa;
    color: #6b7280;
    margin: 0;
    overflow-x: hidden;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideUpFade {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulseGlow {
    0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
    100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
  }

  .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; opacity: 0; }
  .animate-slide-up-fade { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
  .smart-badge { animation: pulseGlow 2.5s infinite; }
  
  .delay-100 { animation-delay: 100ms; }
  .delay-200 { animation-delay: 200ms; }
  .delay-300 { animation-delay: 300ms; }
  
  .clean-card {
    background: #ffffff;
    border-radius: 1.25rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.03);
    transition: all 0.3s ease;
  }
  .clean-card:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
  
  .progress-ring__circle {
    transition: stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
  }

  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }

  /* --- DARK MODE --- */
  .theme-dark { background-color: #0a0a0a !important; color: #e5e5e5 !important; }
  .theme-dark .bg-white, .theme-dark .clean-card { background-color: #171717 !important; border-color: #262626 !important; }
  .theme-dark .bg-\\[\\#f8f9fa\\] { background-color: #0a0a0a !important; }
  .theme-dark .bg-gray-50 { background-color: #262626 !important; }
  .theme-dark .bg-gray-100 { background-color: #404040 !important; }
  .theme-dark .bg-gray-800 { background-color: #000000 !important; color: #f5f5f5 !important; }
  .theme-dark .bg-gray-900 { background-color: #000000 !important; }
  .theme-dark .text-gray-900, .theme-dark .text-gray-800, .theme-dark .text-gray-700 { color: #f5f5f5 !important; }
  .theme-dark .text-gray-600 { color: #d4d4d4 !important; }
  .theme-dark .text-gray-500, .theme-dark .text-gray-400 { color: #a3a3a3 !important; }
  .theme-dark .text-gray-300 { color: #737373 !important; }
  .theme-dark .border-gray-50, .theme-dark .border-gray-100, .theme-dark .border-gray-200, .theme-dark .border-white { border-color: #262626 !important; }
  .theme-dark input, .theme-dark select { background-color: #0a0a0a !important; color: #f5f5f5 !important; border-color: #262626 !important; }
  .theme-dark input::placeholder { color: #737373 !important; }
  
  /* Exceções de Identidade Visual */
  .theme-dark .text-red-500 { color: #ef4444 !important; }
  .theme-dark .text-red-600 { color: #dc2626 !important; }
  .theme-dark .bg-red-50 { background-color: rgba(239, 68, 68, 0.15) !important; }
  .theme-dark .border-red-100 { border-color: rgba(239, 68, 68, 0.3) !important; }
  .theme-dark .border-red-300 { border-color: rgba(239, 68, 68, 0.5) !important; }
  .theme-dark .border-red-400 { border-color: rgba(239, 68, 68, 0.6) !important; }

  .theme-dark .text-emerald-400 { color: #34d399 !important; }
  .theme-dark .text-emerald-500 { color: #10b981 !important; }
  .theme-dark .text-emerald-600 { color: #34d399 !important; } 
  .theme-dark .bg-emerald-500 { background-color: #10b981 !important; }
  .theme-dark .bg-emerald-50 { background-color: rgba(16, 185, 129, 0.15) !important; }
  .theme-dark .border-emerald-100 { border-color: rgba(16, 185, 129, 0.3) !important; }
  .theme-dark .border-emerald-300 { border-color: rgba(16, 185, 129, 0.5) !important; }
  .theme-dark .border-emerald-400 { border-color: rgba(16, 185, 129, 0.6) !important; }
  .theme-dark .border-l-emerald-500 { border-left-color: #10b981 !important; }

  .theme-dark .text-blue-500 { color: #3b82f6 !important; }

  .theme-dark .shadow-sm, .theme-dark .shadow-md, .theme-dark .shadow-lg, .theme-dark .shadow-xl, .theme-dark .shadow-2xl {
    box-shadow: 0 10px 30px rgba(0,0,0,0.6) !important;
  }
  .theme-dark .bg-white\\/90 { background-color: rgba(23, 23, 23, 0.85) !important; backdrop-filter: blur(16px); }
  .theme-dark .bg-white\\/70 { background-color: rgba(23, 23, 23, 0.7) !important; }
  .theme-dark .bg-white\\/50 { background-color: rgba(23, 23, 23, 0.5) !important; }
  .theme-dark .bg-gray-50\\/50, .theme-dark .bg-gray-50\\/30, .theme-dark .bg-gray-50\\/20, .theme-dark .bg-gray-50\\/40 {
    background-color: rgba(10, 10, 10, 0.4) !important;
  }
  .theme-dark circle[stroke="#e5e7eb"], .theme-dark circle[stroke="#f3f4f6"] { stroke: #262626 !important; }
`;

export default function App() {
  // --- Estados Base ---
  const [userName, setUserName] = useLocalStorage('titovest_user', '');
  const [welcomeName, setWelcomeName] = useState('');
  const [isDarkMode, setIsDarkMode] = useLocalStorage('titovest_theme', false); 
  
  // --- Navegação e Filtros ---
  const [activeTab, setActiveTab] = useState('home'); 
  const [historyFilter, setHistoryFilter] = useState('all'); 
  const [txFilter, setTxFilter] = useState('in'); 

  // --- Motor de Meses ---
  const monthOptions = useMemo(() => generateMonths(), []);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}`;
  });
  const mKey = `_${selectedMonth}`;

  const [isPrivate, setIsPrivate] = useState(false);
  const [goalIndex, setGoalIndex] = useState(0);
  const [chartPeriod, setChartPeriod] = useState('6M');
  
  // --- Modais ---
  const [txModal, setTxModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [fixedCostModal, setFixedCostModal] = useState(false);
  const [goalModal, setGoalModal] = useState(false);
  const [addGoalValueModal, setAddGoalValueModal] = useState(null);
  const [addGoalAmount, setAddGoalAmount] = useState('');
  const [extInvModal, setExtInvModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [emergencyModal, setEmergencyModal] = useState(false);
  const [salaryConfirmModal, setSalaryConfirmModal] = useState(null);

  // --- Estados Persistentes ---
  const [salary, setSalary] = useLocalStorage('titovest_salary' + mKey, 0);
  const [salaryInput, setSalaryInput] = useState(''); 
  const [transactions, setTransactions] = useLocalStorage('titovest_transactions' + mKey, []);
  const [fixedCosts, setFixedCosts] = useLocalStorage('titovest_fixed_costs' + mKey, []);
  const [goals, setGoals] = useLocalStorage('titovest_goals' + mKey, []);
  const [investmentsExt, setInvestmentsExt] = useLocalStorage('titovest_inv_ext' + mKey, []); 
  const [emergencyFund, setEmergencyFund] = useLocalStorage('titovest_emergency_fund' + mKey, { current: 0, target: 0 });

  // --- Segurança de Listas ---
  const tList = Array.isArray(transactions) ? transactions : [];
  const fcList = Array.isArray(fixedCosts) ? fixedCosts : [];
  const gList = Array.isArray(goals) ? goals : [];
  const invExtList = Array.isArray(investmentsExt) ? investmentsExt : [];
  const eFund = (emergencyFund && typeof emergencyFund === 'object') ? emergencyFund : { current: 0, target: 0 };

  // --- Inputs Temporários ---
  const [newTx, setNewTx] = useState({ amount: '', desc: '' });
  const [newFixedCost, setNewFixedCost] = useState({ name: '', amount: '', due: '' });
  const [newExtInv, setNewExtInv] = useState({ type: 'Dólar (USD)', name: '', amount: '', rate: '' });
  const [newGoal, setNewGoal] = useState({ name: '', target: '', current: '' });
  const [newEmergency, setNewEmergency] = useState({ current: '', target: '' });

  useEffect(() => {
    setSalaryInput(salary || '');
    setGoalIndex(0);
  }, [salary, selectedMonth]);

  // --- Matemática Financeira ---
  const totalIn = tList.filter(t => t.type === 'in').reduce((acc, t) => acc + t.amount, 0);
  const totalOut = tList.filter(t => t.type === 'out').reduce((acc, t) => acc + t.amount, 0);
  const availableBalance = totalIn - totalOut; 
  
  const committedTotal = fcList.reduce((acc, c) => acc + c.amount, 0);
  const availableAfterFixed = (Number(salary) || 0) - committedTotal;
  
  const avgVariableCosts = totalOut > 0 ? totalOut : 0; 
  const finalForecast = (Number(salary) || 0) - committedTotal - avgVariableCosts;

  const isNegative = finalForecast < 0;
  const forecastColor = isNegative ? 'text-red-500' : 'text-emerald-500';
  const forecastColorBold = isNegative ? 'text-red-600' : 'text-emerald-600';
  const forecastBorder = isNegative ? 'border-red-400' : 'border-emerald-400';

  const totalInvestmentsExt = invExtList.reduce((acc, inv) => acc + inv.amount, 0);
  const totalInvested = totalInvestmentsExt;
  const totalBalance = availableBalance + totalInvested;

  const previousMonthData = useMemo(() => {
    try {
      const [year, month] = selectedMonth.split('-');
      let prevYear = parseInt(year, 10);
      let prevMonth = parseInt(month, 10) - 1;
      if (prevMonth === 0) { prevMonth = 12; prevYear -= 1; }
      const prevKeyStr = `_${prevYear}-${String(prevMonth).padStart(2, '0')}`;
      const pTx = JSON.parse(window.localStorage.getItem('titovest_transactions' + prevKeyStr)) || [];
      const pInvExt = JSON.parse(window.localStorage.getItem('titovest_inv_ext' + prevKeyStr)) || [];
      const pIn = Array.isArray(pTx) ? pTx.filter(t => t.type === 'in').reduce((acc, t) => acc + t.amount, 0) : 0;
      const pOut = Array.isArray(pTx) ? pTx.filter(t => t.type === 'out').reduce((acc, t) => acc + t.amount, 0) : 0;
      const pAvail = pIn - pOut;
      const pInvestedExt = Array.isArray(pInvExt) ? pInvExt.reduce((acc, inv) => acc + inv.amount, 0) : 0;
      return pAvail + pInvestedExt;
    } catch (e) { return 0; }
  }, [selectedMonth]);

  let growthRate = 0;
  let hasValidGrowth = false;
  if (previousMonthData > 0 && totalBalance > 0) {
    growthRate = ((totalBalance - previousMonthData) / previousMonthData) * 100;
    hasValidGrowth = true;
  }

  const savingsRate = (Number(salary) > 0) ? (((Number(salary) || 0) - committedTotal - avgVariableCosts) / Number(salary)) * 100 : 0;
  let healthScore = 0;
  if ((Number(salary) || 0) === 0 && totalBalance === 0) healthScore = 0;
  else if (savingsRate >= 20) healthScore = 95;
  else if (savingsRate >= 10) healthScore = 75;
  else if (savingsRate > 0) healthScore = 60;
  else healthScore = 30;

  // --- Funções de Ação ---
  const showToast = (message) => { setToast(message); setTimeout(() => setToast(null), 3000); };
  
  const handleAddTx = () => {
    if (!newTx.amount || !newTx.desc) return;
    const nTx = { id: Date.now(), name: newTx.desc, status: 'Concluído', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), amount: parseFloat(newTx.amount), type: txModal };
    setTransactions([nTx, ...tList]);
    setTxModal(null); setNewTx({ amount: '', desc: '' }); showToast('Transação salva!');
  };

  const handleDeleteTx = (id) => { setTransactions(tList.filter(t => t.id !== id)); showToast('Removido!'); };
  
  const handleAddFixedCost = () => {
    if (!newFixedCost.amount || !newFixedCost.name) return;
    const nFc = { id: Date.now(), name: newFixedCost.name, due: newFixedCost.due || '01', amount: parseFloat(newFixedCost.amount), iconName: 'Receipt' };
    setFixedCosts([...fcList, nFc]); setFixedCostModal(false); setNewFixedCost({ name: '', amount: '', due: '' }); showToast('Custo adicionado!');
  };

  const removeFixedCost = (id) => { setFixedCosts(fcList.filter(c => c.id !== id)); showToast('Custo removido.'); };

  const handleAddExtInvestment = () => {
    if (!newExtInv.amount || !newExtInv.type) return;
    const rate = parseFloat(newExtInv.rate) || 1;
    const nInv = { id: Date.now(), type: newExtInv.type, name: newExtInv.name || newExtInv.type, amount: parseFloat(newExtInv.amount) * rate };
    setInvestmentsExt([...invExtList, nInv]); setExtInvModal(false); setNewExtInv({ type: 'Dólar (USD)', name: '', amount: '', rate: '' }); showToast('Investimento adicionado!');
  };

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.target) return;
    const nGoal = { id: Date.now(), name: newGoal.name, target: parseFloat(newGoal.target), current: parseFloat(newGoal.current) || 0 };
    setGoals([...gList, nGoal]); setGoalModal(false); setNewGoal({ name: '', target: '', current: '' }); showToast('Meta criada!');
  };

  const handleAddValueToGoal = () => {
    if (!addGoalValueModal || !addGoalAmount) return;
    const amount = parseFloat(addGoalAmount);
    if (isNaN(amount) || amount <= 0) return;
  
    const updatedGoals = gList.map(g => {
      if (g.id === addGoalValueModal.id) {
        return { ...g, current: (g.current || 0) + amount };
      }
      return g;
    });
    
    setGoals(updatedGoals);
    setAddGoalValueModal(null);
    setAddGoalAmount('');
    showToast('Valor adicionado à meta!');
  };

  const nextGoal = () => { if (gList.length > 0) setGoalIndex((prev) => (prev + 1) % gList.length); };
  const prevGoal = () => { if (gList.length > 0) setGoalIndex((prev) => (prev - 1 + gList.length) % gList.length); };
  
  const handleResetData = () => { if(window.confirm("Apagar todos os dados?")) { localStorage.clear(); window.location.reload(); } };
  const openHistory = (filterType) => { setHistoryFilter(filterType); setActiveTab('history'); };

  // --- TELA DE BOAS VINDAS ---
  if (!userName) {
    return (
      <div className={`flex h-screen w-full items-center justify-center overflow-hidden relative px-4 ${isDarkMode ? 'theme-dark bg-[#0a0a0a]' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
        <style>{customStyles}</style>
        <div className="absolute top-6 right-6 z-50">
           <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 text-gray-400 hover:text-gray-800 bg-white/50 border border-gray-100 rounded-full transition-colors relative backdrop-blur-md shadow-sm">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-red-500/[0.04] rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-red-500/[0.05] rounded-full blur-[150px] pointer-events-none"></div>

        <div className="z-10 p-8 md:p-12 flex flex-col items-center text-center max-w-[420px] w-full bg-white/70 backdrop-blur-xl rounded-[24px] border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] animate-slide-up-fade">
           <div className="w-12 h-12 mb-5">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M 5 20 Q 50 35 95 20 Q 75 35 60 35 L 60 80 L 70 100 L 30 100 L 40 80 L 40 35 Q 25 35 5 20 Z" fill="#dc2626" />
              </svg>
           </div>
           
           <h1 className="text-3xl font-medium text-gray-900 mb-2 tracking-tight">Tito<span className="text-red-600">Vest</span></h1>
           <p className="text-gray-500 text-sm mb-10">O seu controle financeiro começa aqui.</p>
           
           <input 
             type="text" 
             placeholder="Como podemos te chamar?" 
             value={welcomeName} 
             onChange={e=>setWelcomeName(e.target.value)} 
             onKeyDown={(e) => { if(e.key === 'Enter' && welcomeName.trim()) setUserName(welcomeName.trim()) }}
             className="w-full px-5 py-4 bg-white/60 border border-gray-100 rounded-2xl focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] focus:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 text-gray-800 font-medium mb-6 text-center placeholder:text-gray-400" 
           />
           
           <button 
             onClick={() => {if(welcomeName.trim()) setUserName(welcomeName.trim())}} 
             className="w-full py-4 bg-red-500 text-white font-medium uppercase tracking-widest rounded-2xl hover:bg-red-600 hover:scale-[1.03] transition-all duration-300 shadow-xl shadow-red-500/20 flex items-center justify-center gap-2"
           >
             Entrar <ArrowRight className="w-4 h-4"/>
           </button>
        </div>
      </div>
    );
  }

  // --- Telas ---
  const renderHistory = () => {
    const filteredTx = historyFilter === 'all' 
      ? tList 
      : tList.filter(t => t.type === historyFilter);
    
    const total = filteredTx.reduce((acc, t) => acc + t.amount, 0);

    let title = "Histórico de Transações";
    if(historyFilter === 'in') title = "Apenas Entradas";
    if(historyFilter === 'out') title = "Apenas Saídas";

    return (
      <div className="animate-fade-in flex flex-col h-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('wallet')} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-2xl font-medium text-gray-800">{title}</h2>
          </div>
          <div className="flex bg-white rounded-xl border border-gray-100 p-1 shadow-sm self-start sm:self-auto">
             <button onClick={()=>setHistoryFilter('all')} className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${historyFilter === 'all' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Tudo</button>
             <button onClick={()=>setHistoryFilter('in')} className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${historyFilter === 'in' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Entradas</button>
             <button onClick={()=>setHistoryFilter('out')} className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${historyFilter === 'out' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Saídas</button>
          </div>
        </div>

        {historyFilter !== 'all' && (
          <div className={`clean-card p-6 md:p-8 mb-6 border-l-4 ${historyFilter === 'in' ? 'border-l-gray-800' : 'border-l-red-500'}`}>
            <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mb-1">Total {historyFilter === 'in' ? 'Entradas' : 'Saídas'}</p>
            <p className={`text-3xl md:text-4xl font-medium ${historyFilter === 'in' ? 'text-gray-900' : 'text-red-500'}`}>
              <AnimatedNumber value={total} prefix="R$ " decimals={2} isPrivate={isPrivate} />
            </p>
          </div>
        )}

        <div className="clean-card flex-1 flex flex-col overflow-hidden min-h-[400px]">
          <div className="flex-1 overflow-y-auto p-2 md:p-4">
            {filteredTx.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-10 text-gray-400 text-sm">
                <span className="mb-2 opacity-50"><Clock className="w-8 h-8"/></span>
                Nenhum registro encontrado neste mês.
              </div>
            ) : (
              filteredTx.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 md:p-4 hover:bg-gray-50 rounded-xl transition-colors group border border-transparent hover:border-gray-100 mb-2">
                  <div className="flex items-center gap-3 md:gap-4 truncate">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'in' ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-500'}`}>
                      {tx.type === 'in' ? <ArrowDownRight className="w-4 h-4 md:w-5 md:h-5" /> : <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-gray-800 truncate">{tx.name}</p>
                      <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">{tx.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-5 shrink-0">
                    <span className={`text-sm md:text-base font-medium ${tx.type === 'in' ? 'text-gray-900' : 'text-red-500'}`}>
                      R$ {isPrivate ? '••••' : tx.amount.toLocaleString('pt-BR', {minimumFractionDigits:2})}
                    </span>
                    <button onClick={() => handleDeleteTx(tx.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100" title="Apagar transação">
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderHome = () => (
    <>
      <div className="flex items-center justify-between mb-4 md:mb-6 animate-fade-in">
         <h2 className="text-2xl font-medium text-gray-800">Visão Geral</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        
        <div className="lg:col-span-4 flex flex-col gap-6 md:gap-10">
          <div className="clean-card p-6 md:p-10 animate-fade-in flex flex-col items-center text-center relative overflow-hidden h-[250px] md:h-[300px] justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full blur-[50px] opacity-50 -z-10"></div>
            <p className="text-sm text-gray-400 font-normal mb-2">Saldo Atual da Carteira</p>
            <h3 className="text-4xl md:text-5xl font-medium text-gray-800 mb-6 md:mb-8 tracking-tight">
              <AnimatedNumber value={totalBalance} prefix="R$ " decimals={2} isPrivate={isPrivate} />
            </h3>
            {hasValidGrowth && (
              <div className="flex gap-3">
                <span className="hidden sm:inline-block text-xs font-medium text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">Retorno Mensal</span>
                <span className={`text-xs font-medium px-4 py-2 rounded-lg flex items-center border border-gray-100 ${growthRate >= 0 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
                  {growthRate >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1).replace('.', ',')}%
                </span>
              </div>
            )}
          </div>

          <div className="clean-card p-6 md:p-8 animate-fade-in delay-200 h- min h- flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-base font-medium text-gray-800 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500"/> Reserva
               </h3>
               <button onClick={() => {
                 setNewEmergency({ current: eFund.current, target: eFund.target });
                 setEmergencyModal(true);
               }} className="text-[10px] md:text-xs font-medium text-gray-400 hover:text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">Editar</button>
            </div>
            
            <div className="flex flex-col gap-4 flex-1 justify-center">
               <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mb-1">Valor Guardado</span>
                  <span className="text-3xl font-medium text-gray-800">R$ {isPrivate ? '••••' : (eFund.current || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mb-1">Objetivo</span>
                  <span className="text-base font-medium text-gray-500">R$ {isPrivate ? '••••' : (eFund.target || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
               </div>
            </div>
            
            {(eFund.target || 0) > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-50">
                <div className="w-full bg-gray-100 rounded-full h-2 md:h-3 overflow-hidden mb-2">
                   <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${Math.min(((eFund.current || 0) / eFund.target) * 100, 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Progresso</span>
                  <span>{Math.round(Math.min(((eFund.current || 0) / eFund.target) * 100, 100))}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col">
          <div className="clean-card flex-1 animate-fade-in delay-100 flex flex-col overflow-hidden">
            <div className="px-5 py-5 md:px-8 md:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border-b border-gray-50 gap-4 sm:gap-0">
              <h3 className="text-base font-medium text-gray-700">Transações Recentes</h3>
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={() => setTxModal('in')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-medium px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Entrada
                </button>
                <button onClick={() => setTxModal('out')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-medium px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Saída
                </button>
              </div>
            </div>
            
            <div className="flex flex-col flex-1 max-h-[400px] overflow-y-auto">
              {tList.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400 text-sm text-center">
                  <span className="block mb-2 text-gray-300"><Wallet className="w-8 h-8"/></span>
                  Nenhuma transação registada neste mês.
                </div>
              ) : (
                tList.slice(0, 6).map((tx, i) => (
                  <div key={tx.id} className="px-5 py-4 md:px-8 md:py-6 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <div className="flex items-center gap-3 md:gap-5">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'in' ? 'bg-gray-50 text-gray-500 border border-gray-100' : 'bg-red-50 text-red-400'}`}>
                         {tx.type === 'in' ? <ArrowDownRight className="w-4 h-4 md:w-5 md:h-5" /> : <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />}
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-700 truncate max-w-[130px] sm:max-w-[200px] md:max-w-none">{tx.name}</span>
                        <span className="block text-xs text-gray-400 mt-1 uppercase tracking-wider">{tx.time}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 md:gap-5 shrink-0">
                      <span className={`text-sm md:text-base font-medium ${tx.type === 'in' ? 'text-gray-900' : 'text-red-500'}`}>
                        R$ {isPrivate ? '••••' : tx.amount.toLocaleString('pt-BR', {minimumFractionDigits:2})}
                      </span>
                      <button onClick={() => handleDeleteTx(tx.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100" title="Apagar transação">
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-5 py-6 md:px-8 md:py-8 border-t border-gray-50 bg-gray-50/30 flex flex-row items-center justify-between mt-auto gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-sm font-medium text-gray-700">Saúde Financeira Geral</span>
                <span className="hidden sm:block text-xs text-gray-400">Gestão de gastos e poupança dentro do limite ideal.</span>
              </div>
              <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e5e7eb" strokeWidth="12" />
                  <circle 
                    className="progress-ring__circle"
                    cx="50" cy="50" r="40" 
                    fill="transparent" 
                    stroke={healthScore > 60 ? "#34d399" : "#ef4444"} 
                    strokeWidth="12" 
                    strokeLinecap="round"
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * healthScore) / 100}
                  />
                </svg>
                <span className="text-xs md:text-sm font-bold text-gray-800">{isPrivate ? '••' : `${Math.round(healthScore)}%`}</span>
              </div>
            </div>
            <div className="py-4 md:py-5 bg-white flex justify-center border-t border-gray-50">
              <button onClick={() => openHistory('all')} className="text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors uppercase tracking-widest">Ver histórico completo</button>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-fade-in delay-400 mt-6 md:mt-10">
        <h3 className="text-base font-medium text-gray-700 mb-4 md:mb-6">Andamento das Metas</h3>
        
        {gList.length === 0 ? (
           <div className="clean-card flex flex-col items-center justify-center py-12 w-full border-dashed border-2 border-gray-200 bg-gray-50/30">
              <Target className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-6 text-sm text-center px-4">Nenhuma meta cadastrada para este mês.</p>
              <button onClick={() => setActiveTab('profile')} className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-colors shadow-md">Ir para perfil</button>
           </div>
        ) : (
          <div className="clean-card relative overflow-hidden py-8 md:p-10 flex flex-col md:flex-row items-center justify-center gap-12 min-h-[250px]">
            <button onClick={prevGoal} className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-2 md:p-3 text-gray-300 hover:text-red-500 z-20">
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 stroke-[1]" />
            </button>
            <button onClick={nextGoal} className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-2 md:p-3 text-gray-300 hover:text-red-500 z-20">
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8 stroke-[1]" />
            </button>

            <div className="w-full max-w-lg overflow-hidden px-8 md:px-0">
              <div className="flex transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${goalIndex * 100}%)` }}>
                {gList.map((goal, index) => {
                    const isActive = index === goalIndex;
                    const perc = isActive ? Math.min(((goal.current || 0) / (goal.target || 1)) * 100, 100) : 0;
                    return (
                      <div key={goal.id} className="min-w-full flex flex-col md:flex-row items-center gap-6 md:gap-12 px-2 md:px-10 group relative">
                        
                        {/* LIXEIRA CORRIGIDA AQUI */}
                        <button onClick={() => {
                          setGoals(gList.filter(g => g.id !== goal.id));
                          showToast('Meta removida!');
                        }} className={`absolute top-0 right-0 p-2 text-gray-300 hover:text-red-500 transition-opacity ${isActive ? 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100' : 'opacity-0 pointer-events-none'}`}>
                           <Trash2 className="w-4 h-4"/>
                        </button>
                        
                        <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="8" />
                            <circle className="progress-ring__circle" cx="50" cy="50" r="40" fill="transparent" stroke="#dc2626" strokeWidth="8" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * perc) / 100} />
                          </svg>
                          <span className="text-lg md:text-2xl font-medium text-gray-800">{isPrivate ? '••%' : `${Math.round(perc)}%`}</span>
                        </div>
                        <div className="text-center md:text-left flex flex-col items-center md:items-start">
                          <h4 className="text-lg md:text-xl font-medium text-gray-800 mb-2 md:mb-3">{goal.name}</h4>
                          <p className="text-sm text-gray-400 mb-1">Atual: <span className="text-gray-700 font-medium">{isPrivate ? 'R$ •••' : `R$ ${(goal.current || 0).toLocaleString('pt-BR')}`}</span></p>
                          <p className="text-sm text-gray-400">Objetivo: <span className="text-gray-700 font-medium">{isPrivate ? 'R$ •••' : `R$ ${(goal.target || 0).toLocaleString('pt-BR')}`}</span></p>
                          <button onClick={() => { setAddGoalValueModal(goal); setAddGoalAmount(''); }} className="mt-3 md:mt-4 px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 text-[10px] md:text-xs font-medium rounded-xl transition-colors border border-gray-100 w-fit">Adicionar valor</button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  const renderWallet = () => (
    <>
      <h2 className="text-2xl font-medium text-gray-800 animate-fade-in mb-4 md:mb-6">Gestão da Carteira</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 animate-fade-in">
        <div onClick={() => openHistory('in')} className="clean-card p-5 md:p-6 flex items-center gap-4 md:gap-5 border-l-4 border-l-gray-800 cursor-pointer hover:-translate-y-1 transition-all group">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center shrink-0 group-hover:bg-gray-100 transition-colors">
            <ArrowDownRight className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-between">Total de Entradas <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"/></p>
            <p className="text-xl md:text-2xl font-medium text-gray-800">
              <AnimatedNumber value={totalIn} prefix="R$ " decimals={2} isPrivate={isPrivate} />
            </p>
          </div>
        </div>
        <div onClick={() => openHistory('out')} className="clean-card p-5 md:p-6 flex items-center gap-4 md:gap-5 border-l-4 border-l-red-500 cursor-pointer hover:-translate-y-1 transition-all group">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
            <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-between">Total de Saídas <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"/></p>
            <p className="text-xl md:text-2xl font-medium text-red-500">
              <AnimatedNumber value={totalOut} prefix="R$ " decimals={2} isPrivate={isPrivate} />
            </p>
          </div>
        </div>
        
        <div className="clean-card p-5 md:p-6 flex items-center gap-4 md:gap-5 border-l-4 border-l-emerald-500 shadow-md transition-colors duration-300">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="flex flex-col w-full">
            <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mb-1">Saldo Atual</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
              <AnimatedNumber value={totalBalance} prefix="R$ " decimals={2} isPrivate={isPrivate} />
            </p>
            <div className="flex gap-3 mt-1.5 w-full justify-between pr-2">
              <span className="text-[9px] md:text-[10px] text-gray-500 font-medium">Livre: R$ {isPrivate ? '••••' : availableBalance.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span>
              <span className="text-[9px] md:text-[10px] text-emerald-500 font-semibold">Investido: R$ {isPrivate ? '••••' : totalInvested.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        <div className="lg:col-span-7 flex flex-col gap-6 animate-fade-in delay-100">
          
          <div className="clean-card p-6 md:p-8 flex flex-col relative overflow-hidden h-[160px] justify-center">
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-gray-50 rounded-full blur-[40px] opacity-50 pointer-events-none"></div>
            
            <label className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-4 block">Salário Mensal / Renda Base</label>
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R$</span>
              <input 
                type="number" 
                value={salaryInput} 
                onChange={(e) => setSalaryInput(e.target.value)}
                onKeyDown={(e) => {
                  if(e.key === 'Enter') {
                    e.preventDefault();
                    setSalaryConfirmModal(Number(e.target.value) || 0);
                  }
                }}
                placeholder="0.00"
                className="w-full pl-11 pr-4 py-3 md:py-4 text-lg md:text-xl font-medium text-gray-800 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-gray-300 focus:bg-transparent transition-all shadow-inner" 
              />
            </div>
            <p className="text-[9px] md:text-[10px] text-gray-400 mt-3">Pressione <strong className="text-gray-500">ENTER</strong> para confirmar e atualizar.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="clean-card p-5 md:p-6">
              <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mb-2 md:mb-3">Após Gastos Fixos</p>
              <p className="text-xl md:text-2xl font-medium text-gray-700">
                <AnimatedNumber value={availableAfterFixed} prefix="R$ " decimals={2} isPrivate={isPrivate} />
              </p>
              <p className="text-xs text-gray-400 mt-2">Salário - Custos Fixos</p>
            </div>
            
            <div className="clean-card p-5 md:p-6 border-b-4 border-b-red-400">
              <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-2"><Activity className="w-3 h-3"/> Média Variáveis</p>
              <p className="text-xl md:text-2xl font-medium text-red-500">
                <AnimatedNumber value={avgVariableCosts} prefix="R$ " decimals={2} isPrivate={isPrivate} />
              </p>
              <p className="text-xs text-gray-400 mt-2">Baseado nas transações</p>
            </div>
          </div>

          <div className="clean-card p-6 md:p-8">
            <div className="flex justify-between items-center mb-4 md:mb-6">
               <h3 className="text-base font-medium text-gray-800 flex items-center gap-2">
                 <DollarSign className="w-5 h-5 text-gray-400" /> Investimentos Externos
               </h3>
               <button onClick={() => setExtInvModal(true)} className="text-[10px] md:text-xs font-medium text-gray-500 hover:text-emerald-600 bg-white border border-gray-100 px-3 py-1.5 rounded-lg shadow-sm transition-colors">Adicionar</button>
            </div>
            
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {invExtList.length === 0 ? (
                 <p className="text-xs text-gray-400 py-4 text-center">Nenhum investimento externo/personalizado.</p>
              ) : (
                invExtList.map(inv => (
                  <div key={inv.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors group">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800">{inv.type}</span>
                      <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest">{inv.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-sm md:text-base font-medium text-gray-800">R$ {isPrivate ? '••••' : inv.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                       <button onClick={() => {
                         setInvestmentsExt(invExtList.filter(c => c.id !== inv.id));
                         showToast('Investimento removido');
                       }} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6 animate-fade-in delay-200">
          
          <div className="clean-card flex flex-col flex-1 h-[420px] max-h-[420px] mb-28">
            <div className="p-5 md:p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 rounded-t-2xl">
              <div>
                <h3 className="text-base font-medium text-gray-800">Custos Fixos & Assinaturas</h3>
                <p className="text-[10px] md:text-xs text-red-500 font-medium mt-1 uppercase tracking-widest">Total: R$ {isPrivate ? '••••' : committedTotal.toLocaleString('pt-BR', {minimumFractionDigits:2})}</p>
              </div>
              <button onClick={() => setFixedCostModal(true)} className="w-8 h-8 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:text-red-500 hover:border-red-100 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {fcList.length === 0 ? (
                <div className="flex-1 flex items-center justify-center h-full p-8 text-gray-400 text-sm text-center">Adicione dados para visualizar seus custos fixos.</div>
              ) : (
                fcList.map((cost) => {
                  const IconCmp = getIcon(cost.iconName);
                  return (
                    <div key={cost.id} className="flex items-center justify-between p-3 md:p-4 hover:bg-gray-50 rounded-xl transition-colors group border-b border-transparent hover:border-gray-50">
                      <div className="flex items-center gap-3 md:gap-4 truncate">
                        <div className="w-10 h-10 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-red-400 shadow-sm transition-colors shrink-0">
                          <IconCmp className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-gray-700 truncate">{cost.name}</p>
                          <p className="text-xs text-gray-400">Dia {cost.due}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        <span className="text-sm font-medium text-gray-800">R$ {isPrivate ? '•••' : (cost.amount || 0).toFixed(2)}</span>
                        <button onClick={() => removeFixedCost(cost.id)} className="text-gray-300 hover:text-red-500 p-2 md:p-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );

  const renderProfile = () => (
    <>
      <h2 className="text-2xl font-medium text-gray-800 animate-fade-in mb-4 md:mb-6">Seu Perfil Financeiro</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10 animate-fade-in">
        <div className="clean-card p-5 md:p-6 flex flex-col justify-center">
          <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mb-1 md:mb-2">Salário Base</p>
          <p className="text-xl md:text-2xl font-medium text-gray-800"><AnimatedNumber value={salary} prefix="R$ " isPrivate={isPrivate}/></p>
        </div>
        <div className="clean-card p-5 md:p-6 flex flex-col justify-center">
          <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mb-1 md:mb-2">Gastos Fixos</p>
          <p className="text-xl md:text-2xl font-medium text-gray-800"><AnimatedNumber value={committedTotal} prefix="R$ " isPrivate={isPrivate}/></p>
        </div>
        <div className="clean-card p-5 md:p-6 flex flex-col justify-center">
          <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mb-1 md:mb-2">Gastos Variáveis</p>
          <p className="text-xl md:text-2xl font-medium text-red-500"><AnimatedNumber value={avgVariableCosts} prefix="R$ " isPrivate={isPrivate}/></p>
        </div>
        <div className={`clean-card p-5 md:p-6 flex flex-col justify-center border-b-4 ${forecastBorder}`}>
          <p className={`text-[10px] md:text-xs font-semibold uppercase tracking-widest mb-1 md:mb-2 ${forecastColor}`}>Dinheiro Livre</p>
          <p className={`text-xl md:text-2xl font-medium ${forecastColorBold}`}><AnimatedNumber value={finalForecast} prefix="R$ " isPrivate={isPrivate}/></p>
          <p className="text-[10px] md:text-xs text-blue-500 mt-2 font-medium opacity-90">Valor investido: R$ {isPrivate ? '••••' : totalInvested.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 mb-8 md:mb-10">
        
        <div className="lg:col-span-8 flex flex-col">
          <div className="clean-card p-6 md:p-10 animate-fade-in delay-100 flex-1 flex flex-col justify-center">
            <h3 className="text-base font-medium text-gray-800 mb-6 md:mb-8 border-b border-gray-50 pb-4">Resumo Financeiro</h3>
            
            <div className="flex flex-col gap-6 md:gap-10">
              <div>
                 <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mb-2">Patrimônio Atual</p>
                 <p className="text-4xl md:text-5xl font-medium text-gray-800 tracking-tight">
                   <AnimatedNumber value={totalBalance} prefix="R$ " decimals={2} isPrivate={isPrivate} />
                 </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mb-1">Econ. Mensal Estimada</p>
                    <p className={`text-xl md:text-2xl font-medium ${forecastColor}`}>
                      <AnimatedNumber value={finalForecast} prefix="R$ " decimals={2} isPrivate={isPrivate} />
                    </p>
                 </div>
                 <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mb-1">Renda Poupada</p>
                    <p className="text-xl md:text-2xl font-medium text-gray-800">
                      {isPrivate ? '••%' : `${Math.max(0, Math.round(savingsRate))}%`}
                    </p>
                 </div>
              </div>

              <div className="mt-2 pt-4">
                 <div className="flex justify-between items-end mb-3">
                   <span className="text-xs md:text-sm text-gray-500">Você está economizando <span className={`font-semibold ${forecastColorBold}`}>{Math.max(0, Math.round(savingsRate))}%</span> da sua renda mensal.</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-3 md:h-4 overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ease-out ${isNegative ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}></div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <div className="clean-card p-8 md:p-10 animate-fade-in delay-200 text-center flex-1 flex flex-col items-center justify-center relative overflow-hidden min-h-[250px]">
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-emerald-500 rounded-full blur-[60px] opacity-10 pointer-events-none"></div>
            <h3 className="text-base font-medium text-gray-800 mb-6 md:mb-8">Score de Saúde Financeira</h3>
            
            <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center mb-6">
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e5e7eb" strokeWidth="8" />
                <circle 
                  className="progress-ring__circle"
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke={healthScore > 60 ? "#34d399" : "#ef4444"} 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  strokeDasharray="251.2" 
                  strokeDashoffset={251.2 - (251.2 * healthScore) / 100}
                />
              </svg>
              <span className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-800">{isPrivate ? '••' : `${Math.round(healthScore)}`}</span>
            </div>
            <p className="text-xs md:text-sm text-gray-500 px-2 md:px-4">
              {healthScore > 60 ? 'Finanças equilibradas e organizadas.' : 'Cuidado, proporção perigosa.'}
            </p>
          </div>
        </div>
      </div>

      <div className="clean-card p-6 md:p-8 animate-fade-in delay-300 w-full mb-8 md:mb-12">
         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 md:mb-8 border-b border-gray-50 pb-4 gap-4 sm:gap-0">
            <h3 className="text-lg font-medium text-gray-800">Suas Metas</h3>
            <button onClick={() => setGoalModal(true)} className="flex items-center justify-center gap-2 text-xs font-medium bg-red-50 text-red-500 px-4 py-2.5 sm:py-2 rounded-lg hover:bg-red-100 transition-colors w-full sm:w-auto">
               <Plus className="w-4 h-4"/> Adicionar Meta
            </button>
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {gList.length === 0 ? (
               <p className="text-gray-400 text-sm col-span-full text-center py-4">Adicione dados para visualizar suas metas.</p>
            ) : (
              gList.map(goal => {
                const perc = Math.min(((goal.current || 0) / (goal.target || 1)) * 100, 100);
                return (
                  <div key={goal.id} className="flex items-center gap-4 md:gap-6 p-4 border border-gray-50 bg-gray-50/30 rounded-2xl flex-col min-[400px]:flex-row text-center min-[400px]:text-left relative group overflow-hidden w-full shrink-0">
                     {/* Botão Excluir Meta */}
                     <button onClick={() => {
                        setGoals(gList.filter(g => g.id !== goal.id));
                        showToast('Meta removida!');
                     }} className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                        <Trash2 className="w-4 h-4"/>
                     </button>

                     <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e5e7eb" strokeWidth="8" />
                          <circle className="progress-ring__circle" cx="50" cy="50" r="40" fill="transparent" stroke="#dc2626" strokeWidth="8" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * perc) / 100} />
                        </svg>
                        <span className="text-xs md:text-sm font-bold text-gray-700">{isPrivate ? '••' : `${Math.round(perc)}%`}</span>
                     </div>
                     <div className="flex flex-col w-full items-center min-[400px]:items-start">
                        <span className="font-medium text-gray-800 mb-1">{goal.name}</span>
                        <span className="text-xs text-gray-400">Objetivo: R$ {isPrivate ? '••••' : (goal.target || 0).toLocaleString('pt-BR')}</span>
                        <span className="text-xs text-gray-500 font-medium">Atual: R$ {isPrivate ? '••••' : (goal.current || 0).toLocaleString('pt-BR')}</span>
                        <button onClick={() => { setAddGoalValueModal(goal); setAddGoalAmount(''); }} className="mt-3 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-[10px] md:text-xs font-medium rounded-xl transition-colors border border-gray-100">Adicionar valor</button>
                     </div>
                  </div>
                )
              })
            )}
         </div>
      </div>
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHome();
      case 'wallet': return renderWallet();
      case 'profile': return renderProfile();
      case 'history': return renderHistory();
      default: return renderHome();
    }
  };

  // --- ESTRUTURA PRINCIPAL ---
  return (
    <>
      <style>{customStyles}</style>
      
      {/* Wrapper Principal Sensível ao Tema */}
      <div className={`flex h-screen w-full overflow-hidden relative transition-colors duration-300 ${isDarkMode ? 'theme-dark bg-[#0a0a0a]' : 'bg-[#f8f9fa]'}`}>
        
        {/* Sidebar Esquerda (Desktop) */}
        <aside className="hidden md:flex w-20 bg-white border-r border-gray-100 flex-col items-center py-8 z-20 flex-shrink-0 transition-colors duration-300">
          <div onClick={() => setActiveTab('home')} className="mb-12 group cursor-pointer" title="TitoVest">
            <svg viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-sm group-hover:scale-105 transition-transform">
              <path d="M 5 20 Q 50 35 95 20 Q 75 35 60 35 L 60 80 L 70 100 L 30 100 L 40 80 L 40 35 Q 25 35 5 20 Z" fill="#dc2626" />
            </svg>
          </div>

          <nav className="flex flex-col gap-8 flex-1 w-full mt-2">
            {[
              { id: 'home', icon: Home, title: "Início" },
              { id: 'wallet', icon: Wallet, title: "Carteira" },
              { id: 'profile', icon: User, title: "Perfil" },
              { id: 'history', icon: Clock, title: "Histórico" }
            ].map((item) => (
              <div key={item.id} onClick={() => {
                if(item.id === 'history') setHistoryFilter('all');
                setActiveTab(item.id);
              }} title={item.title} className="relative group flex justify-center cursor-pointer">
                {activeTab === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r-md transition-all"></div>}
                <div className={`p-2 rounded-lg transition-colors ${activeTab === item.id ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}`}>
                  <item.icon className="w-6 h-6 stroke-[1.5]" />
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto">
             <div onClick={() => setSettingsModal(true)} className="p-2 text-gray-300 hover:text-gray-600 transition-colors cursor-pointer" title="Definições">
              <Settings className="w-6 h-6" />
            </div>
          </div>
        </aside>

        {/* Área Principal */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto relative">
          
          {/* Header Superior */}
          <header className="bg-white/90 backdrop-blur-md sticky top-0 z-30 px-5 md:px-10 py-4 md:py-5 flex justify-between items-center border-b border-gray-100 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <div className="md:hidden w-8 h-8 cursor-pointer" onClick={() => setActiveTab('home')}>
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path d="M 5 20 Q 50 35 95 20 Q 75 35 60 35 L 60 80 L 70 100 L 30 100 L 40 80 L 40 35 Q 25 35 5 20 Z" fill="#dc2626" />
                </svg>
              </div>
              <h1 className="text-lg md:text-xl font-medium text-gray-700 tracking-tight cursor-pointer transition-colors duration-300" onClick={() => setActiveTab('home')}>
                Tito<span className="text-red-500">Vest</span>
              </h1>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
              <div className="flex gap-2 md:gap-4 items-center">
                <button onClick={() => setIsPrivate(!isPrivate)} className="p-2 text-gray-400 hover:text-gray-800 bg-gray-50/50 rounded-full transition-colors">
                  {isPrivate ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
                
                {/* BOTÃO: DARK / LIGHT MODE */}
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-gray-400 hover:text-gray-800 bg-gray-50/50 rounded-full transition-colors relative">
                  {isDarkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
              </div>

              <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1 md:mx-2 transition-colors duration-300"></div>

              <div onClick={() => setActiveTab('profile')} className="flex items-center gap-2 md:gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-700 transition-colors duration-300">{userName}</p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 transition-colors hover:bg-gray-100 uppercase font-medium text-xs md:text-base">
                  {userName ? userName.charAt(0) : <User className="w-4 h-4" />}
                </div>
              </div>
            </div>
          </header>

          {/* Padding bottom extra no mobile por causa da nav bar */}
          <div className="p-4 md:p-10 pb-28 md:pb-12 max-w-7xl mx-auto w-full flex-1 flex flex-col">
            {renderContent()}
          </div>
        </main>

        {/* Navigation Bottom Bar (Mobile) */}
        {userName && (
          <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-gray-100 z-40 flex justify-around items-center px-2 py-2 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.03)] transition-colors duration-300">
            {[
              { id: 'home', icon: Home, label: 'Início' },
              { id: 'wallet', icon: Wallet, label: 'Carteira' },
              { id: 'profile', icon: User, label: 'Perfil' },
              { id: 'history', icon: Clock, label: 'Histórico' }
            ].map((item) => (
              <div key={item.id} onClick={() => {
                if(item.id === 'history') setHistoryFilter('all'); 
                setActiveTab(item.id);
              }} className="relative flex flex-col items-center justify-center p-2 w-16 h-12">
                <item.icon className={`w-5 h-5 mb-1 transition-colors ${(activeTab === item.id || (activeTab === 'history' && item.id === 'history')) ? 'text-red-500 stroke-[2]' : 'text-gray-400 stroke-[1.5]'}`} />
                <span className={`text-[9px] transition-colors ${(activeTab === item.id || (activeTab === 'history' && item.id === 'history')) ? 'text-red-500 font-medium' : 'text-gray-400'}`}>{item.label}</span>
              </div>
            ))}
          </nav>
        )}

        {/* MODAL: Definições e Reset */}
        {settingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/20 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-[24px] w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden mx-auto transition-colors duration-300">
                <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-50 transition-colors duration-300">
                  <h3 className="text-base md:text-lg font-medium text-gray-800 tracking-tight flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-500" /> Definições
                  </h3>
                  <button onClick={() => setSettingsModal(false)} className="p-2 text-gray-400 hover:text-gray-700 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 md:p-8 space-y-4">
                   <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5"/>
                      <div>
                        <h4 className="text-sm font-semibold text-red-600 mb-1">Zona de Perigo</h4>
                        <p className="text-xs text-red-500/80 leading-relaxed">
                          Apagar os dados irá remover permanentemente todo o teu histórico, metas e informações de todos os meses.
                        </p>
                      </div>
                   </div>
                </div>
                <div className="p-6 md:p-8 pt-0 flex gap-3 md:gap-4 flex-col">
                   <button onClick={handleResetData} className="w-full py-3 md:py-4 bg-red-500 text-white text-[10px] md:text-xs font-medium uppercase tracking-widest rounded-2xl hover:bg-red-600 transition-colors shadow-lg shadow-red-100 hover:-translate-y-0.5">Apagar todos os dados</button>
                   <button onClick={() => setSettingsModal(false)} className="w-full py-3 md:py-4 text-gray-600 bg-gray-50 text-[10px] md:text-xs font-medium uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-colors">Cancelar</button>
                </div>
             </div>
          </div>
        )}

        {/* MODAL: Confirmação de Salário */}
        {salaryConfirmModal !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/20 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-[24px] w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden mx-auto transition-colors duration-300">
                <div className="p-6 md:p-8 space-y-4">
                   <h3 className="text-lg font-medium text-gray-800">Adicionar salário como transação?</h3>
                   <p className="text-sm text-gray-500 leading-relaxed">
                     Você gostaria de adicionar esse valor como uma entrada nas transações recentes? Isso ajuda a manter seu dashboard atualizado automaticamente.
                   </p>
                </div>
                <div className="p-6 md:p-8 pt-0 flex gap-3 md:gap-4 flex-col">
                   <button onClick={() => {
                      setSalary(salaryConfirmModal);
                      const nTx = {
                        id: Date.now(),
                        name: 'Salário Mensal',
                        status: 'Concluído',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        amount: salaryConfirmModal,
                        type: 'in'
                      };
                      setTransactions([nTx, ...tList]);
                      setSalaryConfirmModal(null);
                      showToast('Salário e transação adicionados!');
                   }} className="w-full py-3 md:py-4 bg-emerald-500 text-white text-[10px] md:text-xs font-medium uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100 hover:-translate-y-0.5">Sim, adicionar</button>
                   
                   <button onClick={() => {
                      setSalary(salaryConfirmModal);
                      setSalaryConfirmModal(null);
                      showToast('Salário atualizado!');
                   }} className="w-full py-3 md:py-4 text-gray-600 bg-gray-100 text-[10px] md:text-xs font-medium uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-colors">Não</button>
                </div>
             </div>
          </div>
        )}

        {/* MODAL: Nova Transação */}
        {txModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/20 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[24px] w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden mx-auto transition-colors duration-300">
              <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-50 transition-colors duration-300">
                <h3 className="text-base md:text-lg font-medium text-gray-800 tracking-tight flex items-center gap-2">
                  {txModal === 'in' ? <ArrowDownRight className="w-5 h-5 text-gray-600" /> : <ArrowUpRight className="w-5 h-5 text-red-500" />}
                  Registar {txModal === 'in' ? 'Entrada' : 'Saída'}
                </h3>
                <button onClick={() => setTxModal(null)} className="p-2 text-gray-400 hover:text-gray-700 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-widest ml-1">Valor (R$)</label>
                  <input type="number" value={newTx.amount || ''} onChange={e => setNewTx({...newTx, amount: e.target.value})} placeholder="0.00" className="w-full px-4 md:px-5 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-red-300 focus:bg-transparent transition-colors text-gray-800 font-medium text-sm md:text-base" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-widest ml-1">Descrição</label>
                  <input type="text" value={newTx.desc || ''} onChange={e => setNewTx({...newTx, desc: e.target.value})} placeholder="Ex: Salário, Lanche..." className="w-full px-4 md:px-5 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-red-300 focus:bg-transparent transition-colors text-gray-800 text-sm md:text-base" />
                </div>
              </div>
              <div className="p-6 md:p-8 pt-0 flex gap-3 md:gap-4">
                <button onClick={() => setTxModal(null)} className="flex-1 py-3 md:py-4 text-gray-600 text-[10px] md:text-xs font-medium uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-colors">Cancelar</button>
                <button onClick={handleAddTx} className={`flex-1 py-3 md:py-4 text-white text-[10px] md:text-xs font-medium uppercase tracking-widest rounded-2xl transition-all shadow-lg hover:-translate-y-0.5 ${txModal === 'in' ? 'bg-gray-800 shadow-gray-200' : 'bg-red-500 shadow-red-100'}`}>Salvar</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Novo Gasto Fixo */}
        {fixedCostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/20 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[24px] w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden mx-auto transition-colors duration-300">
              <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-50 transition-colors duration-300">
                <h3 className="text-base md:text-lg font-medium text-gray-800 tracking-tight flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-600" /> Novo Gasto Fixo
                </h3>
                <button onClick={() => setFixedCostModal(false)} className="p-2 text-gray-400 hover:text-gray-700 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-widest ml-1">Nome da Conta</label>
                  <input type="text" value={newFixedCost.name || ''} onChange={e => setNewFixedCost({...newFixedCost, name: e.target.value})} placeholder="Ex: Academia" className="w-full px-4 md:px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-red-300 text-gray-800 text-sm md:text-base transition-colors" />
                </div>
                <div className="flex gap-3 md:gap-4">
                  <div className="space-y-2 flex-1">
                    <label className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-widest ml-1">Valor</label>
                    <input type="number" value={newFixedCost.amount || ''} onChange={e => setNewFixedCost({...newFixedCost, amount: e.target.value})} placeholder="0.00" className="w-full px-4 md:px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-red-300 text-gray-800 font-medium text-sm md:text-base transition-colors" />
                  </div>
                  <div className="space-y-2 w-1/3">
                    <label className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-widest ml-1">Dia</label>
                    <input type="text" value={newFixedCost.due || ''} onChange={e => setNewFixedCost({...newFixedCost, due: e.target.value})} placeholder="15" className="w-full px-4 md:px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-red-300 text-gray-800 text-center text-sm md:text-base transition-colors" />
                  </div>
                </div>
              </div>
              <div className="p-6 md:p-8 pt-0 flex gap-3 md:gap-4">
                <button onClick={() => setFixedCostModal(false)} className="flex-1 py-3 md:py-4 text-gray-600 text-[10px] md:text-xs font-medium uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-colors">Cancelar</button>
                <button onClick={handleAddFixedCost} className="flex-1 py-3 md:py-4 bg-gray-800 text-white text-[10px] md:text-xs font-medium uppercase tracking-widest rounded-2xl hover:bg-gray-900 transition-colors shadow-lg shadow-gray-200 hover:-translate-y-0.5">Adicionar</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Reserva de Emergência */}
        {emergencyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/20 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[24px] w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden mx-auto transition-colors duration-300">
              <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-50 transition-colors duration-300">
                <h3 className="text-base md:text-lg font-medium text-gray-800 tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" /> Reserva
                </h3>
                <button onClick={() => setEmergencyModal(false)} className="p-2 text-gray-400 hover:text-gray-700 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-widest ml-1">Valor Guardado (R$)</label>
                  <input type="number" value={newEmergency.current || ''} onChange={e => setNewEmergency({...newEmergency, current: e.target.value})} placeholder="0.00" className="w-full px-4 md:px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-emerald-300 text-gray-800 font-medium text-sm md:text-base transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-widest ml-1">Objetivo (R$)</label>
                  <input type="number" value={newEmergency.target || ''} onChange={e => setNewEmergency({...newEmergency, target: e.target.value})} placeholder="0.00" className="w-full px-4 md:px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-emerald-300 text-gray-800 font-medium text-sm md:text-base transition-colors" />
                </div>
              </div>
              <div className="p-6 md:p-8 pt-0 flex gap-3 md:gap-4">
                <button onClick={() => setEmergencyModal(false)} className="flex-1 py-3 md:py-4 text-gray-600 text-[10px] md:text-xs font-medium uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-colors">Cancelar</button>
                <button onClick={() => {
                   setEmergencyFund({ current: Number(newEmergency.current) || 0, target: Number(newEmergency.target) || 0 });
                   setEmergencyModal(false);
                   showToast('Reserva atualizada!');
                }} className="flex-1 py-3 md:py-4 bg-emerald-500 text-white text-[10px] md:text-xs font-medium uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100 hover:-translate-y-0.5">Salvar</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Novo Investimento Customizado (Outros Externos) */}
        {extInvModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/20 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[24px] w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden mx-auto transition-colors duration-300">
              <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-50 transition-colors duration-300">
                <h3 className="text-base md:text-lg font-medium text-gray-800 tracking-tight flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-600" /> Investimento Ext.
                </h3>
                <button onClick={() => setExtInvModal(false)} className="p-2 text-gray-400 hover:text-gray-700 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-widest ml-1">Tipo</label>
                  <select value={newExtInv.type} onChange={e => setNewExtInv({...newExtInv, type: e.target.value})} className="w-full px-4 md:px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-gray-300 text-gray-800 appearance-none text-sm md:text-base transition-colors">
                    <option>Dólar (USD)</option>
                    <option>Euro (EUR)</option>
                    <option>Outros</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-widest ml-1">Descrição (Opcional)</label>
                  <input type="text" value={newExtInv.name || ''} onChange={e => setNewExtInv({...newExtInv, name: e.target.value})} placeholder="Ex: Conta Nomad" className="w-full px-4 md:px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-gray-300 text-gray-800 text-sm md:text-base transition-colors" />
                </div>
                <div className="flex gap-3 md:gap-4">
                  <div className="space-y-2 flex-1">
                    <label className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-widest ml-1">Valor na Moeda</label>
                    <input type="number" value={newExtInv.amount || ''} onChange={e => setNewExtInv({...newExtInv, amount: e.target.value})} placeholder="0.00" className="w-full px-4 md:px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-gray-300 text-gray-800 font-medium text-sm md:text-base transition-colors" />
                  </div>
                  <div className="space-y-2 w-1/3">
                    <label className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-widest ml-1">Cotação R$</label>
                    <input type="number" value={newExtInv.rate || ''} onChange={e => setNewExtInv({...newExtInv, rate: e.target.value})} placeholder="1.00" className="w-full px-4 md:px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-gray-300 text-gray-800 text-center text-sm md:text-base transition-colors" />
                  </div>
                </div>
              </div>
              <div className="p-6 md:p-8 pt-0 flex gap-3 md:gap-4">
                <button onClick={() => setExtInvModal(false)} className="flex-1 py-3 md:py-4 text-gray-600 text-[10px] md:text-xs font-medium uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-colors">Cancelar</button>
                <button onClick={handleAddExtInvestment} className="flex-1 py-3 md:py-4 bg-gray-800 text-white text-[10px] md:text-xs font-medium uppercase tracking-widest rounded-2xl hover:bg-gray-900 transition-colors shadow-lg shadow-gray-200 hover:-translate-y-0.5">Adicionar</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Nova Meta */}
        {goalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/20 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[24px] w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden mx-auto transition-colors duration-300">
              <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-50 transition-colors duration-300">
                <h3 className="text-base md:text-lg font-medium text-gray-800 tracking-tight flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-500" /> Nova Meta
                </h3>
                <button onClick={() => setGoalModal(false)} className="p-2 text-gray-400 hover:text-gray-700 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-widest ml-1">Nome da Meta</label>
                  <input type="text" value={newGoal.name || ''} onChange={e => setNewGoal({...newGoal, name: e.target.value})} placeholder="Ex: Comprar Carro" className="w-full px-4 md:px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-red-300 text-gray-800 text-sm md:text-base transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-widest ml-1">Valor Alvo (R$)</label>
                  <input type="number" value={newGoal.target || ''} onChange={e => setNewGoal({...newGoal, target: e.target.value})} placeholder="0.00" className="w-full px-4 md:px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-red-300 text-gray-800 font-medium text-sm md:text-base transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-widest ml-1">Já Guardado (Opcional)</label>
                  <input type="number" value={newGoal.current || ''} onChange={e => setNewGoal({...newGoal, current: e.target.value})} placeholder="0.00" className="w-full px-4 md:px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-red-300 text-gray-800 font-medium text-sm md:text-base transition-colors" />
                </div>
              </div>
              <div className="p-6 md:p-8 pt-0 flex gap-3 md:gap-4">
                <button onClick={() => setGoalModal(false)} className="flex-1 py-3 md:py-4 text-gray-600 text-[10px] md:text-xs font-medium uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-colors">Cancelar</button>
                <button onClick={handleAddGoal} className="flex-1 py-3 md:py-4 bg-red-500 text-white text-[10px] md:text-xs font-medium uppercase tracking-widest rounded-2xl hover:bg-red-600 transition-colors shadow-lg shadow-red-100 hover:-translate-y-0.5">Criar Meta</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Adicionar Valor à Meta */}
        {addGoalValueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/20 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[24px] w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden mx-auto transition-colors duration-300">
              <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-50 transition-colors duration-300">
                <h3 className="text-base md:text-lg font-medium text-gray-800 tracking-tight flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-500" /> Adicionar Valor
                </h3>
                <button onClick={() => setAddGoalValueModal(null)} className="p-2 text-gray-400 hover:text-gray-700 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mb-1">Meta: {addGoalValueModal.name}</p>
                  <p className="text-sm font-medium text-gray-800">
                    Atual: R$ {(addGoalValueModal.current || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-widest ml-1">Valor a adicionar (R$)</label>
                  <input type="number" value={addGoalAmount} onChange={e => setAddGoalAmount(e.target.value)} placeholder="0.00" className="w-full px-4 md:px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-emerald-300 text-gray-800 font-medium text-sm md:text-base transition-colors" />
                </div>
              </div>
              <div className="p-6 md:p-8 pt-0 flex gap-3 md:gap-4">
                <button onClick={() => setAddGoalValueModal(null)} className="flex-1 py-3 md:py-4 text-gray-600 text-[10px] md:text-xs font-medium uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-colors">Cancelar</button>
                <button onClick={handleAddValueToGoal} className="flex-1 py-3 md:py-4 bg-emerald-500 text-white text-[10px] md:text-xs font-medium uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100 hover:-translate-y-0.5">Confirmar</button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST Notification */}
        {toast && (
          <div className="fixed bottom-20 md:bottom-10 right-4 md:right-10 z-50 animate-fade-in">
            <div className="bg-gray-800 text-white px-5 md:px-6 py-3 md:py-4 rounded-2xl shadow-xl shadow-gray-800/20 flex items-center gap-3 md:gap-4">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
              <span className="text-[10px] md:text-xs font-medium tracking-wide uppercase">{toast}</span>
            </div>
          </div>
        )}

      </div>
    </>
  );
}