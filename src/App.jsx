import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './Sidebar';
import AuthScreen from './components/AuthScreen';
import { supabase } from './lib/supabase';
import { getTransactions, createTransaction, deleteTransaction } from './services/transactions';
import { getMonthlyData, upsertMonthlyData } from './services/monthlyData';
import { getFixedCosts, createFixedCost, deleteFixedCost } from './services/fixedCosts';
import {
  Home,
  Wallet,
  User,
  Menu,
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
  Plus,
  X,
  CheckCircle2,
  Trash2,
  Settings,
  CreditCard,
  Activity,
  AlertTriangle,
  LogOut
} from 'lucide-react';

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

// Utilitário para renderizar ícones dinamicamente
const IconMap = { Zap, ShieldCheck, Wifi, MonitorPlay, CreditCard, Receipt: CreditCard };
const getIcon = (name) => IconMap[name] || CreditCard;

// Remove dados financeiros legados do localStorage no logout.
// Usa prefix matching para não tocar em chaves de outros sistemas.
// Coleta as chaves antes de remover — modificar localStorage durante
// iteração por índice causa saltos nos índices restantes.
const FINANCIAL_PREFIXES = [
  'titovest_transactions_',
  'titovest_salary_',
  'titovest_fixed_costs_',
  'titovest_goals_',
  'titovest_inv_ext_',
  'titovest_emergency_fund_',
  'titovest_user',
];

function clearFinancialLocalStorage() {
  const toRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && FINANCIAL_PREFIXES.some(prefix => key.startsWith(prefix))) {
      toRemove.push(key);
    }
  }
  toRemove.forEach(key => localStorage.removeItem(key));
}

// --- Estilos Globais Premium ---
const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');

  /* ═══════════════════════════════════════════
     KEYFRAMES
  ═══════════════════════════════════════════ */
  @keyframes titovest-pulse {
    0%, 100% { transform: scale(1.00); opacity: 1; }
    50%       { transform: scale(0.98); opacity: 0.82; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideUpFade {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes sheetSlideUp {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }
  @keyframes pulseGlow {
    0%   { box-shadow: 0 0 0 0   rgba(109, 74, 173, 0.22); }
    70%  { box-shadow: 0 0 0 8px rgba(109, 74, 173, 0.00); }
    100% { box-shadow: 0 0 0 0   rgba(109, 74, 173, 0.00); }
  }

  /* ═══════════════════════════════════════════
     BASE
  ═══════════════════════════════════════════ */
  .scrollbar-none::-webkit-scrollbar { display: none; }
  .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

  .animate-fade-in       { animation: fadeIn 0.45s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }
  .animate-slide-up-fade { animation: slideUpFade 0.6s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }
  .smart-badge           { animation: pulseGlow 2.5s infinite; }

  .delay-100 { animation-delay: 100ms; }
  .delay-200 { animation-delay: 200ms; }
  .delay-300 { animation-delay: 300ms; }
  .delay-400 { animation-delay: 400ms; }

  .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }

  body {
    font-family: 'Outfit', sans-serif;
    font-weight: 400;
    background-color: #000000;
    color: #e2e2e2;
    margin: 0;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Scrollbar premium */
  ::-webkit-scrollbar       { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.10); border-radius: 8px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }

  /* ═══════════════════════════════════════════
     DESIGN TOKENS — CARD
  ═══════════════════════════════════════════ */
  .clean-card {
    background:         rgba(255, 255, 255, 0.038);
    backdrop-filter:    blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius:      14px;
    border:             1px solid rgba(255, 255, 255, 0.062);
    box-shadow:         0 1px 6px rgba(0,0,0,0.24);
    font-family: 'Manrope', sans-serif;
    transition:
      border-color  200ms ease,
      box-shadow    200ms ease;
  }
  .clean-card:hover {
    border-color: rgba(255,255,255,0.096);
    box-shadow:   0 2px 10px rgba(0,0,0,0.30);
  }

  /* Números financeiros — figura tabelada, tracking apertado */
  .tv-num {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum";
    letter-spacing: -0.025em;
    font-family: 'Manrope', sans-serif;
  }

  /* Micro-labels uppercase */
  .tv-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.38);
    font-family: 'Outfit', sans-serif;
  }

  /* Números grandes dentro de cards herdam tv-num automaticamente */
  .clean-card .text-xl,
  .clean-card .text-2xl,
  .clean-card .text-3xl,
  .clean-card .text-4xl,
  .clean-card .text-5xl {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum";
    letter-spacing: -0.022em;
    font-family: 'Manrope', sans-serif;
  }

  /* ═══════════════════════════════════════════
     PROGRESS RINGS
  ═══════════════════════════════════════════ */
  .progress-ring__circle {
    transition: stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1);
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
  }
  .clean-card svg    { overflow: visible; shape-rendering: geometricPrecision; }
  .clean-card circle { stroke-linecap: round; paint-order: stroke fill; }

  /* ═══════════════════════════════════════════
     INPUTS
  ═══════════════════════════════════════════ */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

  /* ═══════════════════════════════════════════
     DARK THEME — Base
  ═══════════════════════════════════════════ */
  .theme-dark { background-color: #000000 !important; color: #e2e2e2 !important; }

  .theme-dark .bg-white      { background-color: #0d0d0d !important; border-color: rgba(255,255,255,0.07) !important; }
  .theme-dark .clean-card    {
    background: rgba(255,255,255,0.038) !important;
    border-color: rgba(255,255,255,0.062) !important;
  }
  .theme-dark .bg-\\[\\#f8f9fa\\] { background-color: #000000 !important; }
  .theme-dark .bg-gray-50    { background-color: rgba(255,255,255,0.040) !important; }
  .theme-dark .bg-gray-100   { background-color: rgba(255,255,255,0.075) !important; }
  .theme-dark .bg-gray-800   { background-color: #080808 !important; color: #f0f0f0 !important; }
  .theme-dark .bg-gray-900   { background-color: #000000 !important; }

  /* ── Hierarquia de texto ── */
  .theme-dark .text-gray-900,
  .theme-dark .text-gray-800 { color: #f0f0f0 !important; }
  .theme-dark .text-gray-700 { color: #d4d4d4 !important; }
  .theme-dark .text-gray-600 { color: #a8a8a8 !important; }
  .theme-dark .text-gray-500,
  .theme-dark .text-gray-400 { color: #707070 !important; }
  .theme-dark .text-gray-300 { color: #424242 !important; }

  /* ── Bordas ── */
  .theme-dark .border-gray-50,
  .theme-dark .border-gray-100,
  .theme-dark .border-gray-200,
  .theme-dark .border-white  { border-color: rgba(255,255,255,0.07) !important; }

  /* ── Inputs ── */
  .theme-dark input,
  .theme-dark select {
    background-color: rgba(255,255,255,0.04) !important;
    color: #f0f0f0 !important;
    border-color: rgba(255,255,255,0.09) !important;
    transition: border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease;
  }
  .theme-dark input::placeholder { color: rgba(255,255,255,0.22) !important; }
  .theme-dark input:focus,
  .theme-dark select:focus {
    border-color: rgba(109,74,173,0.55) !important;
    background-color: rgba(255,255,255,0.07) !important;
    box-shadow: 0 0 0 3px rgba(109,74,173,0.13) !important;
    outline: none !important;
  }

  /* ── Fundos translúcidos ── */
  .theme-dark .bg-white\\/90 { background-color: rgba(8,8,8,0.92) !important; backdrop-filter: blur(16px); }
  .theme-dark .bg-white\\/70 { background-color: rgba(8,8,8,0.70) !important; }
  .theme-dark .bg-white\\/50 { background-color: rgba(8,8,8,0.50) !important; }
  .theme-dark .bg-gray-50\\/50,
  .theme-dark .bg-gray-50\\/30,
  .theme-dark .bg-gray-50\\/20,
  .theme-dark .bg-gray-50\\/40 { background-color: rgba(255,255,255,0.022) !important; }

  /* ── Sombras ── */
  .theme-dark .shadow-sm,
  .theme-dark .shadow-md,
  .theme-dark .shadow-lg,
  .theme-dark .shadow-xl,
  .theme-dark .shadow-2xl { box-shadow: 0 4px 28px rgba(0,0,0,0.55) !important; }

  /* ═══════════════════════════════════════════
     DARK THEME — Acento roxo (substitui vermelho)
  ═══════════════════════════════════════════ */
  .theme-dark .text-red-400,
  .theme-dark .text-red-500  { color: #a78bfa !important; }
  .theme-dark .text-red-600  { color: #8b5cf6 !important; }
  .theme-dark .bg-red-50     { background-color: rgba(109,74,173,0.11) !important; }
  .theme-dark .bg-red-100    { background-color: rgba(109,74,173,0.18) !important; }
  .theme-dark .bg-red-500    { background-color: #6d4aad !important; }
  .theme-dark .bg-red-600    { background-color: #5a3a90 !important; }
  .theme-dark .border-red-100  { border-color: rgba(109,74,173,0.22) !important; }
  .theme-dark .border-red-300  { border-color: rgba(109,74,173,0.38) !important; }
  .theme-dark .border-red-400  { border-color: rgba(109,74,173,0.55) !important; }
  .theme-dark .border-l-red-500  { border-left-color: #7756c5 !important; }
  .theme-dark .border-b-red-400  { border-bottom-color: rgba(109,74,173,0.60) !important; }
  .theme-dark .hover\\:bg-red-50:hover   { background-color: rgba(109,74,173,0.11) !important; }
  .theme-dark .hover\\:bg-red-100:hover  { background-color: rgba(109,74,173,0.18) !important; }
  .theme-dark .hover\\:bg-red-600:hover  { background-color: #5a3a90 !important; }
  .theme-dark .hover\\:text-red-500:hover { color: #a78bfa !important; }
  .theme-dark .shadow-red-100,
  .theme-dark .shadow-red-500\\/20 { box-shadow: 0 8px 28px rgba(109,74,173,0.22) !important; }

  /* ── Verde — estados positivos ── */
  .theme-dark .text-emerald-400 { color: #34d399 !important; }
  .theme-dark .text-emerald-500 { color: #10b981 !important; }
  .theme-dark .text-emerald-600 { color: #34d399 !important; }
  .theme-dark .bg-emerald-500   { background-color: #10b981 !important; }
  .theme-dark .bg-emerald-50    { background-color: rgba(16,185,129,0.10) !important; }
  .theme-dark .border-emerald-100 { border-color: rgba(16,185,129,0.20) !important; }
  .theme-dark .border-emerald-300 { border-color: rgba(16,185,129,0.38) !important; }
  .theme-dark .border-emerald-400 { border-color: rgba(16,185,129,0.55) !important; }
  .theme-dark .border-l-emerald-500 { border-left-color: #10b981 !important; }

  /* ── Azul ── */
  .theme-dark .text-blue-500 { color: #60a5fa !important; }

  /* ═══════════════════════════════════════════
     DARK THEME — Progress rings SVG
  ═══════════════════════════════════════════ */
  .theme-dark circle[stroke="#e5e7eb"],
  .theme-dark circle[stroke="#f3f4f6"] {
    stroke: rgba(255,255,255,0.09) !important;
    stroke-width: 5 !important;
  }
  .theme-dark circle[stroke="#dc2626"],
  .theme-dark circle[stroke="#ef4444"] {
    stroke: #7756c5 !important;
    stroke-width: 5 !important;
    stroke-linecap: round !important;
  }
  .theme-dark circle[stroke="#34d399"] {
    stroke: #10b981 !important;
    stroke-width: 5 !important;
    stroke-linecap: round !important;
  }

  /* ═══════════════════════════════════════════
     DARK THEME — Glass card: superfícies internas
  ═══════════════════════════════════════════ */
  .theme-dark .clean-card .bg-white,
  .theme-dark .clean-card .bg-gray-50    { background-color: rgba(255,255,255,0.038) !important; }
  .theme-dark .clean-card .bg-gray-100   { background-color: rgba(255,255,255,0.070) !important; }
  .theme-dark .clean-card .bg-gray-50\\/30,
  .theme-dark .clean-card .bg-gray-50\\/50 { background-color: rgba(255,255,255,0.020) !important; }

  /* Bordas internas */
  .theme-dark .clean-card .border-gray-50,
  .theme-dark .clean-card .border-gray-100 { border-color: rgba(255,255,255,0.07) !important; }
  .theme-dark .clean-card .border-gray-200 { border-color: rgba(255,255,255,0.10) !important; }

  /* Hover de linhas internas */
  .theme-dark .clean-card .hover\\:bg-gray-50\\/50:hover { background-color: rgba(255,255,255,0.038) !important; }
  .theme-dark .clean-card .hover\\:bg-gray-50:hover      { background-color: rgba(255,255,255,0.038) !important; }
  .theme-dark .clean-card .hover\\:bg-gray-100:hover     { background-color: rgba(255,255,255,0.070) !important; }

  /* Hierarquia tipográfica dentro dos cards */
  .theme-dark .clean-card .text-gray-900,
  .theme-dark .clean-card .text-gray-800 { color: #efefef !important; }
  .theme-dark .clean-card .text-gray-700 { color: #c4c4c4 !important; }
  .theme-dark .clean-card .text-gray-600 { color: #969696 !important; }
  .theme-dark .clean-card .text-gray-500 { color: #6e6e6e !important; }
  .theme-dark .clean-card .text-gray-400 { color: #505050 !important; }
  .theme-dark .clean-card .text-gray-300 { color: #363636 !important; }
`;

function BottomSheet({ onClose, children }) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(null);
  const handleRef = useRef(null);

  const onPointerDown = (e) => {
    e.preventDefault();
    dragStartY.current = e.clientY;
    setIsDragging(true);
    handleRef.current?.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (dragStartY.current === null) return;
    const delta = e.clientY - dragStartY.current;
    if (delta > 0) setDragY(delta);
  };
  const onPointerUp = () => {
    if (dragY > 80) { onClose(); return; }
    setDragY(0);
    setIsDragging(false);
    dragStartY.current = null;
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '85vh',
          background: 'rgba(16,16,16,0.98)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          border: '1px solid rgba(255,255,255,0.09)',
          borderBottom: 'none',
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
          animation: 'sheetSlideUp 0.35s cubic-bezier(0.32,0.72,0,1)',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          fontFamily: "'Manrope', sans-serif",
        }}
      >
        <div
          ref={handleRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px', cursor: 'grab', touchAction: 'none', userSelect: 'none' }}
        >
          <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />
        </div>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  // --- Estados Base ---
  const [session, setSession] = useState(undefined); // undefined = carregando, null = sem sessão, object = autenticado
  const [userName, setUserName] = useLocalStorage('titovest_user', '');
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashFading, setSplashFading] = useState(false);

  // Carrega sessão inicial e escuta mudanças de auth
  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => setSession(session))
      .catch(() => setSession(null));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sincroniza userName com o nome do usuário autenticado
  useEffect(() => {
    if (session?.user) {
      const displayName =
        session.user.user_metadata?.name ||
        session.user.email?.split('@')[0] ||
        'Usuário';
      setUserName(displayName);
    }
  }, [session]);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFading(true), 1500);
    const hideTimer = setTimeout(() => {
      setSplashVisible(false);
    }, 1900);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  // --- Navegação e Filtros ---
  const [activeTab, setActiveTab] = useState('home'); 
  const [historyFilter, setHistoryFilter] = useState('all');

  // --- Motor de Meses ---
  const monthOptions = useMemo(() => generateMonths(), []);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}`;
  });
  const mKey = `_${selectedMonth}`;

  const [isPrivate, setIsPrivate] = useState(false);
  const [goalIndex, setGoalIndex] = useState(0);

  // --- Sidebar ---
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- Carregamento via Supabase ---
  const [txLoading, setTxLoading] = useState(false);
  const [mdLoading, setMdLoading] = useState(false);
  const [fcLoading, setFcLoading] = useState(false);

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

  // Carrega transactions do Supabase sempre que sessão ou mês mudar.
  // Em caso de falha, mantém os dados já carregados pelo useLocalStorage como fallback.
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || !selectedMonth) return;

    let cancelled = false;

    const load = async () => {
      setTxLoading(true);

      const { data, error } = await getTransactions(userId, selectedMonth);

      if (cancelled) return;

      if (error) {
        console.warn('[App] Falha ao carregar transactions do Supabase, mantendo localStorage:', error);
      } else {
        setTransactions(data);
      }

      setTxLoading(false);
    };

    load();

    return () => { cancelled = true; };
  }, [session?.user?.id, selectedMonth]);

  // Carrega salary e reserva de emergência do Supabase.
  // data === null significa mês sem registro ainda — localStorage prevalece como fallback.
  // Em caso de erro de rede, os valores do localStorage são mantidos silenciosamente.
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || !selectedMonth) return;

    let cancelled = false;

    const load = async () => {
      setMdLoading(true);

      const { data, error } = await getMonthlyData(userId, selectedMonth);

      if (cancelled) return;

      if (error) {
        console.warn('[App] Falha ao carregar monthly_data, mantendo localStorage:', error);
      } else if (data) {
        setSalary(data.salary);
        setEmergencyFund(data.emergencyFund);
      } else {
        setSalary(0);
        setEmergencyFund({ current: 0, target: 0 });
      }

      setMdLoading(false);
    };

    load();

    return () => { cancelled = true; };
  }, [session?.user?.id, selectedMonth]);

  // Carrega fixed_costs do Supabase sempre que sessão ou mês mudar.
  // Em caso de falha, mantém os dados já carregados pelo useLocalStorage como fallback.
  // Array vazio retornado pelo Supabase é escrito normalmente (mês sem custos fixos).
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || !selectedMonth) return;

    let cancelled = false;

    const load = async () => {
      setFcLoading(true);

      const { data, error } = await getFixedCosts(userId, selectedMonth);

      if (cancelled) return;

      if (error) {
        console.warn('[App] Falha ao carregar fixed_costs do Supabase, mantendo localStorage:', error);
      } else {
        setFixedCosts(data);
      }

      setFcLoading(false);
    };

    load();

    return () => { cancelled = true; };
  }, [session?.user?.id, selectedMonth]);

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
  
  const handleAddTx = async () => {
    if (!newTx.amount || !newTx.desc) return;

    // Fecha o modal e limpa o form antes da chamada assíncrona — resposta visual imediata
    setTxModal(null);
    setNewTx({ amount: '', desc: '' });

    const { data, error } = await createTransaction({
      userId:     session.user.id,
      month:      selectedMonth,
      name:       newTx.desc,
      amount:     parseFloat(newTx.amount),
      type:       txModal,
      occurredAt: new Date(),
    });

    if (error) {
      showToast('Erro ao salvar transação. Tente novamente.');
      return;
    }

    // Usa updater funcional para evitar closure stale em caso de fetch simultâneo
    setTransactions(prev => {
      const list = Array.isArray(prev) ? prev : [];
      return [data, ...list];
    });
    showToast('Transação salva!');
  };

  const handleDeleteTx = async (id) => {
    const { error } = await deleteTransaction(id);

    if (error) {
      showToast('Erro ao remover transação. Tente novamente.');
      return;
    }

    setTransactions(prev => {
      const list = Array.isArray(prev) ? prev : [];
      return list.filter(t => t.id !== id);
    });
    showToast('Removido!');
  };
  
  const handleAddFixedCost = async () => {
    if (!newFixedCost.amount || !newFixedCost.name) return;

    setFixedCostModal(false);
    setNewFixedCost({ name: '', amount: '', due: '' });

    const { data, error } = await createFixedCost({
      userId:   session.user.id,
      month:    selectedMonth,
      name:     newFixedCost.name,
      amount:   parseFloat(newFixedCost.amount),
      dueDay:   Number(newFixedCost.due) || 1,
      iconName: 'CreditCard',
    });

    if (error) {
      showToast('Erro ao adicionar custo. Tente novamente.');
      return;
    }

    setFixedCosts(prev => {
      const list = Array.isArray(prev) ? prev : [];
      return [...list, data];
    });
    showToast('Custo adicionado!');
  };

  const removeFixedCost = async (id) => {
    const { error } = await deleteFixedCost(id);

    if (error) {
      showToast('Erro ao remover custo. Tente novamente.');
      return;
    }

    setFixedCosts(prev => {
      const list = Array.isArray(prev) ? prev : [];
      return list.filter(c => c.id !== id);
    });
    showToast('Custo removido.');
  };

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
  
  // Payload completo para upsert — sempre inclui salary E emergency para não
  // sobrescrever um campo com zero ao salvar o outro.
  const buildMonthlyPayload = (overrides) => ({
    userId:           session.user.id,
    month:            selectedMonth,
    salary:           Number(salary) || 0,
    emergencyCurrent: eFund.current  || 0,
    emergencyTarget:  eFund.target   || 0,
    ...overrides,
  });

  // "Sim, adicionar" — persiste salário e cria transação de entrada
  const handleSalaryWithTransaction = async (amount) => {
    setSalary(amount);
    setSalaryConfirmModal(null);

    const { error: upsertError } = await upsertMonthlyData(
      buildMonthlyPayload({ salary: amount })
    );

    if (upsertError) {
      showToast('Erro ao salvar salário. Tente novamente.');
      return;
    }

    const { data, error } = await createTransaction({
      userId:     session.user.id,
      month:      selectedMonth,
      name:       'Salário Mensal',
      amount,
      type:       'in',
      occurredAt: new Date(),
    });

    if (error) {
      showToast('Salário salvo, mas erro ao registrar transação.');
      return;
    }

    setTransactions(prev => {
      const list = Array.isArray(prev) ? prev : [];
      return [data, ...list];
    });
    showToast('Salário e transação adicionados!');
  };

  // "Não" — persiste salário sem criar transação
  const handleSalaryOnly = async (amount) => {
    setSalary(amount);
    setSalaryConfirmModal(null);

    const { error } = await upsertMonthlyData(
      buildMonthlyPayload({ salary: amount })
    );

    showToast(error ? 'Erro ao salvar salário. Tente novamente.' : 'Salário atualizado!');
  };

  // Persiste reserva de emergência — inclui salary atual para não sobrescrever com 0
  const handleSaveEmergency = async () => {
    const current = Number(newEmergency.current) || 0;
    const target  = Number(newEmergency.target)  || 0;

    setEmergencyFund({ current, target });
    setEmergencyModal(false);

    const { error } = await upsertMonthlyData(
      buildMonthlyPayload({ emergencyCurrent: current, emergencyTarget: target })
    );

    showToast(error ? 'Erro ao salvar reserva. Tente novamente.' : 'Reserva atualizada!');
  };

  const handleResetData = () => { if(window.confirm("Apagar todos os dados?")) { localStorage.clear(); window.location.reload(); } };

  const handleLogout = async () => {
    clearFinancialLocalStorage();
    await supabase.auth.signOut();
    // onAuthStateChange define session como null → AuthScreen é renderizada
  };
  const openHistory = (filterType) => { setHistoryFilter(filterType); setActiveTab('history'); };

  // --- TELA SPLASH / LOADING ---
  // session === undefined enquanto getSession() ainda não respondeu;
  // o splash cobre esse período naturalmente (dura 1.9s).
  if (splashVisible || session === undefined) {
    return (
      <div
        style={{
          background: '#000',
          display: 'flex',
          height: '100dvh',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          overflow: 'hidden',
          opacity: splashFading ? 0 : 1,
          transition: 'opacity 0.4s ease',
        }}
      >
        <style>{customStyles}</style>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '18px',
            animation: 'titovest-pulse 2.8s ease-in-out infinite',
          }}
        >
          <h1
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 500,
              fontSize: 'clamp(2.2rem, 7vw, 3.8rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              margin: 0,
            }}
          >
            <span style={{ color: '#ffffff' }}>Tito</span>
            <span style={{ color: '#6d4aad' }}>Vest</span>
          </h1>
          <div style={{ height: '24px' }} />
        </div>
      </div>
    );
  }

  // --- GATE DE AUTENTICAÇÃO ---
  if (!session) {
    return <AuthScreen />;
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3.5">
            <button onClick={() => setActiveTab('wallet')} className="p-2 rounded-xl hover:bg-gray-50 transition-colors" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <h2 className="text-2xl font-semibold text-gray-800" style={{ letterSpacing: '-0.028em' }}>{title}</h2>
          </div>
          <div className="flex self-start sm:self-auto rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.085)' }}>
            <button onClick={()=>setHistoryFilter('all')} className={`px-4 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${historyFilter === 'all' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`} style={historyFilter === 'all' ? { background: 'rgba(255,255,255,0.12)' } : {}}>Tudo</button>
            <button onClick={()=>setHistoryFilter('in')} className={`px-4 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${historyFilter === 'in' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`} style={historyFilter === 'in' ? { background: 'rgba(255,255,255,0.12)' } : {}}>Entradas</button>
            <button onClick={()=>setHistoryFilter('out')} className={`px-4 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${historyFilter === 'out' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`} style={historyFilter === 'out' ? { background: 'rgba(255,255,255,0.12)' } : {}}>Saídas</button>
          </div>
        </div>

        {historyFilter !== 'all' && (
          <div className={`clean-card p-6 md:p-8 mb-5`} style={{ borderLeft: `2px solid ${historyFilter === 'in' ? 'rgba(255,255,255,0.10)' : 'rgba(109,74,173,0.28)'}` }}>
            <p className="tv-label mb-2">Total {historyFilter === 'in' ? 'Entradas' : 'Saídas'}</p>
            <p className={`text-3xl md:text-4xl font-semibold tv-num ${historyFilter === 'in' ? 'text-gray-900' : 'text-red-500'}`}>
              <AnimatedNumber value={total} prefix="R$ " decimals={2} isPrivate={isPrivate} />
            </p>
          </div>
        )}

        <div className="clean-card flex-1 flex flex-col overflow-hidden min-h-[400px]">
          <div className="flex-1 overflow-y-auto p-2 md:p-3">
            {filteredTx.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-10 text-gray-400 text-sm">
                <Clock className="w-7 h-7 mb-3" style={{ opacity: 0.3 }} />
                <span style={{ letterSpacing: '-0.01em' }}>Nenhum registro encontrado neste mês.</span>
              </div>
            ) : (
              filteredTx.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 md:p-4 hover:bg-gray-50 rounded-xl transition-colors group mb-1">
                  <div className="flex items-center gap-3 md:gap-4 truncate">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'in' ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-500'}`}>
                      {tx.type === 'in' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-gray-800 truncate" style={{ letterSpacing: '-0.01em' }}>{tx.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>{tx.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 shrink-0">
                    <span className={`text-sm font-semibold tv-num ${tx.type === 'in' ? 'text-gray-900' : 'text-red-500'}`}>
                      R$ {isPrivate ? '••••' : tx.amount.toLocaleString('pt-BR', {minimumFractionDigits:2})}
                    </span>
                    <button onClick={() => handleDeleteTx(tx.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100" title="Apagar transação">
                      <Trash2 className="w-3.5 h-3.5" />
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
      <div className="flex items-center justify-between mb-5 md:mb-8 animate-fade-in">
        <h2 className="text-2xl font-semibold text-gray-800" style={{ letterSpacing: '-0.028em' }}>Visão Geral</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
        
        <div className="lg:col-span-4 flex flex-col gap-3 md:gap-4">
          <div className="clean-card p-6 md:p-10 animate-fade-in flex flex-col items-center text-center relative overflow-hidden h-[250px] md:h-[300px] justify-center">
            <p className="tv-label mb-3" style={{ color: 'rgba(255,255,255,0.38)' }}>Saldo Atual da Carteira</p>
            <h3 className="text-4xl md:text-5xl font-semibold text-gray-800 mb-6 md:mb-8 tv-num">
              <AnimatedNumber value={totalBalance} prefix="R$ " decimals={2} isPrivate={isPrivate} />
            </h3>
            {hasValidGrowth && (
              <div className="flex gap-2.5">
                <span className="hidden sm:inline-flex items-center text-[11px] font-medium text-gray-500 bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-100" style={{ letterSpacing: '0.01em' }}>Retorno Mensal</span>
                <span className={`text-[11px] font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1 border ${growthRate >= 0 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-red-600 bg-red-50 border-red-100'}`} style={{ letterSpacing: '0.01em' }}>
                  {growthRate >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1).replace('.', ',')}%
                </span>
              </div>
            )}
          </div>

          <div className="clean-card p-6 md:p-8 animate-fade-in delay-200 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2.5" style={{ letterSpacing: '-0.01em' }}>
                <ShieldCheck className="w-4 h-4 text-emerald-500" style={{ opacity: 0.9 }}/> Reserva de Emergência
              </h3>
              <button onClick={() => {
                setNewEmergency({ current: eFund.current, target: eFund.target });
                setEmergencyModal(true);
              }} className="text-[10px] font-semibold text-gray-400 hover:text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg transition-colors" style={{ letterSpacing: '0.04em' }}>Editar</button>
            </div>

            <div className="flex flex-col gap-5 flex-1 justify-center">
              <div className="flex flex-col gap-1">
                <span className="tv-label">Valor Guardado</span>
                <span className="text-3xl font-semibold text-gray-800 tv-num">R$ {isPrivate ? '••••' : (eFund.current || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="tv-label">Objetivo</span>
                <span className="text-base font-medium text-gray-500 tv-num">R$ {isPrivate ? '••••' : (eFund.target || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
              </div>
            </div>

            {(eFund.target || 0) > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-50">
                <div className="w-full rounded-full h-1.5 overflow-hidden mb-2.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(((eFund.current || 0) / eFund.target) * 100, 100)}%`, background: 'linear-gradient(90deg, #059669 0%, #34d399 100%)' }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400" style={{ letterSpacing: '0.04em' }}>
                  <span>PROGRESSO</span>
                  <span className="text-emerald-500 font-semibold">{Math.round(Math.min(((eFund.current || 0) / eFund.target) * 100, 100))}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col">
          <div className="clean-card flex-1 animate-fade-in delay-100 flex flex-col overflow-hidden">
            <div className="px-5 py-5 md:px-8 md:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-50 gap-4 sm:gap-0" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h3 className="text-sm font-semibold text-gray-700" style={{ letterSpacing: '-0.01em' }}>Transações Recentes</h3>
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={() => setTxModal('in')} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-[11px] font-semibold px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors" style={{ letterSpacing: '0.04em' }}>
                  <Plus className="w-3 h-3" /> Entrada
                </button>
                <button onClick={() => setTxModal('out')} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-[11px] font-semibold px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors" style={{ letterSpacing: '0.04em' }}>
                  <Plus className="w-3 h-3" /> Saída
                </button>
              </div>
            </div>
            
            <div className="flex flex-col flex-1 max-h-[400px] overflow-y-auto">
              {tList.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400 text-sm text-center">
                  <Wallet className="w-7 h-7 mb-3" style={{ opacity: 0.25 }} />
                  <span style={{ letterSpacing: '-0.01em' }}>Nenhuma transação registada neste mês.</span>
                </div>
              ) : (
                tList.slice(0, 6).map((tx) => (
                  <div key={tx.id} className="px-5 py-4 md:px-7 md:py-5 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'in' ? 'bg-gray-50 text-gray-500' : 'bg-red-50 text-red-400'}`} style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                        {tx.type === 'in' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-700 truncate max-w-[130px] sm:max-w-[200px] md:max-w-none" style={{ letterSpacing: '-0.01em' }}>{tx.name}</span>
                        <span className="block text-[10px] text-gray-400 mt-0.5" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>{tx.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-sm font-semibold tv-num ${tx.type === 'in' ? 'text-gray-900' : 'text-red-500'}`}>
                        R$ {isPrivate ? '••••' : tx.amount.toLocaleString('pt-BR', {minimumFractionDigits:2})}
                      </span>
                      <button onClick={() => handleDeleteTx(tx.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100" title="Apagar transação">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-5 py-5 md:px-8 md:py-6 border-t border-gray-50 bg-gray-50/30 flex flex-row items-center justify-between mt-auto gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <span className="text-sm font-semibold text-gray-700" style={{ letterSpacing: '-0.01em' }}>Saúde Financeira</span>
                <span className="hidden sm:block text-[11px] text-gray-400 leading-relaxed">Gestão de gastos e poupança dentro do limite ideal.</span>
              </div>
              <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e5e7eb" strokeWidth="10" />
                  <circle
                    className="progress-ring__circle"
                    cx="50" cy="50" r="40"
                    fill="transparent"
                    stroke={healthScore > 60 ? "#34d399" : "#ef4444"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * healthScore) / 100}
                  />
                </svg>
                <span className="text-xs md:text-sm font-bold text-gray-800 tv-num">{isPrivate ? '••' : `${Math.round(healthScore)}%`}</span>
              </div>
            </div>
            <div className="py-4 flex justify-center border-t border-gray-50" style={{ background: 'rgba(255,255,255,0.015)' }}>
              <button onClick={() => openHistory('all')} className="text-[10px] font-semibold text-gray-400 hover:text-gray-600 transition-colors" style={{ letterSpacing: '0.10em', textTransform: 'uppercase' }}>Ver histórico completo</button>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-fade-in delay-400 mt-7 md:mt-10">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 md:mb-6" style={{ letterSpacing: '-0.01em' }}>Andamento das Metas</h3>
        
        {gList.length === 0 ? (
           <div className="clean-card flex flex-col items-center justify-center py-14 w-full" style={{ borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.10)' }}>
              <Target className="w-10 h-10 mb-4" style={{ color: 'rgba(255,255,255,0.20)' }} />
              <p className="text-gray-400 mb-6 text-sm text-center px-4" style={{ letterSpacing: '-0.01em' }}>Nenhuma meta cadastrada para este mês.</p>
              <button onClick={() => setActiveTab('profile')} className="px-6 py-2.5 text-white rounded-xl text-xs font-semibold hover:opacity-80 transition-opacity shadow-md" style={{ background: '#6d4aad', letterSpacing: '0.04em' }}>Ir para perfil</button>
           </div>
        ) : (
          <div className="clean-card relative overflow-hidden py-8 md:p-10 flex flex-col md:flex-row items-center justify-center gap-12 min-h-[250px]">
            <button onClick={prevGoal} className="absolute left-2 md:left-5 top-1/2 -translate-y-1/2 p-2 z-20 rounded-xl transition-colors hover:bg-gray-50" style={{ color: 'rgba(255,255,255,0.30)' }}>
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
            </button>
            <button onClick={nextGoal} className="absolute right-2 md:right-5 top-1/2 -translate-y-1/2 p-2 z-20 rounded-xl transition-colors hover:bg-gray-50" style={{ color: 'rgba(255,255,255,0.30)' }}>
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
            </button>

            <div className="w-full max-w-lg overflow-hidden px-10 md:px-0">
              <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${goalIndex * 100}%)` }}>
                {gList.map((goal, index) => {
                  const isActive = index === goalIndex;
                  const perc = isActive ? Math.min(((goal.current || 0) / (goal.target || 1)) * 100, 100) : 0;
                  return (
                    <div key={goal.id} className="min-w-full flex flex-col md:flex-row items-center gap-6 md:gap-10 px-2 md:px-10 group relative">
                      <button onClick={() => {
                        setGoals(gList.filter(g => g.id !== goal.id));
                        showToast('Meta removida!');
                      }} className={`absolute top-0 right-0 p-2 text-gray-400 hover:text-red-400 transition-opacity ${isActive ? 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>

                      <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="7" />
                          <circle className="progress-ring__circle" cx="50" cy="50" r="40" fill="transparent" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * perc) / 100} />
                        </svg>
                        <span className="text-lg md:text-2xl font-semibold text-gray-800 tv-num">{isPrivate ? '••%' : `${Math.round(perc)}%`}</span>
                      </div>
                      <div className="text-center md:text-left flex flex-col items-center md:items-start gap-1.5">
                        <h4 className="text-base md:text-lg font-semibold text-gray-800" style={{ letterSpacing: '-0.02em' }}>{goal.name}</h4>
                        <p className="text-xs text-gray-400 tv-num">Atual: <span className="text-gray-600 font-semibold">{isPrivate ? 'R$ •••' : `R$ ${(goal.current || 0).toLocaleString('pt-BR')}`}</span></p>
                        <p className="text-xs text-gray-400 tv-num">Objetivo: <span className="text-gray-600 font-semibold">{isPrivate ? 'R$ •••' : `R$ ${(goal.target || 0).toLocaleString('pt-BR')}`}</span></p>
                        <button onClick={() => { setAddGoalValueModal(goal); setAddGoalAmount(''); }} className="mt-2 px-4 py-2 text-gray-500 hover:text-gray-300 text-[10px] font-semibold rounded-xl transition-colors w-fit" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', letterSpacing: '0.04em' }}>Adicionar valor</button>
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
      <h2 className="text-2xl font-semibold text-gray-800 animate-fade-in mb-5 md:mb-8" style={{ letterSpacing: '-0.028em' }}>Gestão da Carteira</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 animate-fade-in">
        <div onClick={() => openHistory('in')} className="clean-card p-5 md:p-6 flex items-center gap-4 cursor-pointer hover:-translate-y-0.5 transition-transform duration-200 group" style={{ borderLeft: '2px solid rgba(255,255,255,0.10)' }}>
          <div className="w-10 h-10 rounded-2xl bg-gray-50 text-gray-600 flex items-center justify-center shrink-0 group-hover:bg-gray-100 transition-colors">
            <ArrowDownRight className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="tv-label mb-1.5 flex items-center justify-between">Entradas <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity"/></p>
            <p className="text-xl md:text-2xl font-semibold text-gray-800">
              <AnimatedNumber value={totalIn} prefix="R$ " decimals={2} isPrivate={isPrivate} />
            </p>
          </div>
        </div>
        <div onClick={() => openHistory('out')} className="clean-card p-5 md:p-6 flex items-center gap-4 cursor-pointer hover:-translate-y-0.5 transition-transform duration-200 group" style={{ borderLeft: '2px solid rgba(109,74,173,0.28)' }}>
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
            <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="tv-label mb-1.5 flex items-center justify-between">Saídas <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity"/></p>
            <p className="text-xl md:text-2xl font-semibold text-red-500">
              <AnimatedNumber value={totalOut} prefix="R$ " decimals={2} isPrivate={isPrivate} />
            </p>
          </div>
        </div>

        <div className="clean-card p-5 md:p-6 flex items-center gap-4" style={{ borderLeft: '2px solid rgba(16,185,129,0.28)' }}>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="flex flex-col w-full min-w-0">
            <p className="tv-label mb-1.5">Saldo Total</p>
            <p className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight">
              <AnimatedNumber value={totalBalance} prefix="R$ " decimals={2} isPrivate={isPrivate} />
            </p>
            <div className="flex gap-3 mt-1.5 w-full justify-between pr-1">
              <span className="text-[9px] text-gray-500 font-medium" style={{ letterSpacing: '0.02em' }}>Livre: R$ {isPrivate ? '••••' : availableBalance.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span>
              <span className="text-[9px] text-emerald-500 font-semibold" style={{ letterSpacing: '0.02em' }}>Investido: R$ {isPrivate ? '••••' : totalInvested.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
        <div className="lg:col-span-7 flex flex-col gap-3 animate-fade-in delay-100">
          
          <div className="clean-card p-6 md:p-8 flex flex-col relative overflow-hidden h-[160px] justify-center">
            <label className="tv-label mb-4 block">Salário Mensal / Renda Base</label>
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">R$</span>
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
                className="w-full pl-11 pr-4 py-3 md:py-4 text-lg md:text-xl font-semibold text-gray-800 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-gray-300 focus:bg-transparent transition-all tv-num"
              />
            </div>
            <p className="text-[9px] text-gray-400 mt-3" style={{ letterSpacing: '0.02em' }}>Pressione <strong className="text-gray-500">ENTER</strong> para confirmar.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="clean-card p-5 md:p-6">
              <p className="tv-label mb-3">Após Gastos Fixos</p>
              <p className="text-xl md:text-2xl font-semibold text-gray-700">
                <AnimatedNumber value={availableAfterFixed} prefix="R$ " decimals={2} isPrivate={isPrivate} />
              </p>
              <p className="text-[10px] text-gray-400 mt-2.5" style={{ letterSpacing: '0.02em' }}>Salário − Custos Fixos</p>
            </div>
            
            <div className="clean-card p-5 md:p-6" style={{ borderBottom: '1px solid rgba(109,74,173,0.30)' }}>
              <p className="tv-label mb-3 flex items-center gap-1.5"><Activity className="w-3 h-3 opacity-60"/> Gastos Variáveis</p>
              <p className="text-xl md:text-2xl font-semibold text-red-500">
                <AnimatedNumber value={avgVariableCosts} prefix="R$ " decimals={2} isPrivate={isPrivate} />
              </p>
              <p className="text-[10px] text-gray-400 mt-2.5" style={{ letterSpacing: '0.02em' }}>Baseado nas transações</p>
            </div>
          </div>

          <div className="clean-card p-6 md:p-8">
            <div className="flex justify-between items-center mb-5 md:mb-6">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2.5" style={{ letterSpacing: '-0.01em' }}>
                <DollarSign className="w-4 h-4 text-gray-400" style={{ opacity: 0.7 }} /> Investimentos Externos
              </h3>
              <button onClick={() => setExtInvModal(true)} className="text-[10px] font-semibold text-gray-500 hover:text-emerald-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg transition-colors" style={{ letterSpacing: '0.04em' }}>+ Adicionar</button>
            </div>

            <div className="flex flex-col gap-2">
              {invExtList.length === 0 ? (
                <p className="text-[11px] text-gray-400 py-5 text-center" style={{ letterSpacing: '0.02em' }}>Nenhum investimento externo registado.</p>
              ) : (
                invExtList.map(inv => (
                  <div key={inv.id} className="flex justify-between items-center p-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 group" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-gray-800" style={{ letterSpacing: '-0.01em' }}>{inv.type}</span>
                      <span className="text-[10px] text-gray-400" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>{inv.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-800 tv-num">R$ {isPrivate ? '••••' : inv.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                      <button onClick={() => {
                        setInvestmentsExt(invExtList.filter(c => c.id !== inv.id));
                        showToast('Investimento removido');
                      }} className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-3 animate-fade-in delay-200">
          
          <div className="clean-card flex flex-col w-full h-[350px] max-h-[420px] shrink-0 mb-28">
            <div className="p-5 md:p-6 border-b border-gray-50 flex justify-between items-center rounded-t-[20px]" style={{ background: 'rgba(255,255,255,0.022)' }}>
              <div>
                <h3 className="text-sm font-semibold text-gray-800" style={{ letterSpacing: '-0.01em' }}>Custos Fixos & Assinaturas</h3>
                <p className="text-[10px] text-red-500 font-semibold mt-1.5 tv-num" style={{ letterSpacing: '0.02em' }}>Total: R$ {isPrivate ? '••••' : committedTotal.toLocaleString('pt-BR', {minimumFractionDigits:2})}</p>
              </div>
              <button onClick={() => setFixedCostModal(true)} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {fcList.length === 0 ? (
                <div className="flex-1 flex items-center justify-center h-full p-8 text-gray-400 text-sm text-center">Adicione dados para visualizar seus custos fixos.</div>
              ) : (
                fcList.map((cost) => {
                  const IconCmp = getIcon(cost.iconName);
                  return (
                    <div key={cost.id} className="flex items-center justify-between p-3 md:p-4 hover:bg-gray-50 rounded-xl transition-colors group">
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-red-400 transition-colors shrink-0" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
                          <IconCmp className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-gray-700 truncate" style={{ letterSpacing: '-0.01em' }}>{cost.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5" style={{ letterSpacing: '0.04em' }}>DIA {cost.due}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 shrink-0">
                        <span className="text-sm font-semibold text-gray-800 tv-num">R$ {isPrivate ? '•••' : (cost.amount || 0).toFixed(2)}</span>
                        <button onClick={() => removeFixedCost(cost.id)} className="text-gray-400 hover:text-red-400 p-2 md:p-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-3.5 h-3.5" />
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
      <h2 className="text-2xl font-semibold text-gray-800 animate-fade-in mb-5 md:mb-8" style={{ letterSpacing: '-0.028em' }}>Perfil Financeiro</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4 animate-fade-in">
        <div className="clean-card p-5 md:p-6 flex flex-col justify-center gap-1.5">
          <p className="tv-label">Salário Base</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-800"><AnimatedNumber value={salary} prefix="R$ " isPrivate={isPrivate}/></p>
        </div>
        <div className="clean-card p-5 md:p-6 flex flex-col justify-center gap-1.5">
          <p className="tv-label">Gastos Fixos</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-800"><AnimatedNumber value={committedTotal} prefix="R$ " isPrivate={isPrivate}/></p>
        </div>
        <div className="clean-card p-5 md:p-6 flex flex-col justify-center gap-1.5">
          <p className="tv-label">Gastos Variáveis</p>
          <p className="text-xl md:text-2xl font-semibold text-red-500"><AnimatedNumber value={avgVariableCosts} prefix="R$ " isPrivate={isPrivate}/></p>
        </div>
        <div className={`clean-card p-5 md:p-6 flex flex-col justify-center gap-1.5`} style={{ borderBottom: `1px solid ${isNegative ? 'rgba(109,74,173,0.30)' : 'rgba(16,185,129,0.28)'}` }}>
          <p className={`tv-label ${forecastColor}`}>Dinheiro Livre</p>
          <p className={`text-xl md:text-2xl font-semibold ${forecastColorBold}`}><AnimatedNumber value={finalForecast} prefix="R$ " isPrivate={isPrivate}/></p>
          <p className="text-[10px] text-blue-500 font-medium mt-0.5 tv-num" style={{ opacity: 0.85, letterSpacing: '0.01em' }}>Investido: R$ {isPrivate ? '••••' : totalInvested.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 mb-4">
        
        <div className="lg:col-span-8 flex flex-col">
          <div className="clean-card p-6 md:p-10 animate-fade-in delay-100 flex-1 flex flex-col justify-center">
            <h3 className="text-sm font-semibold text-gray-800 mb-6 md:mb-8 border-b border-gray-50 pb-4" style={{ letterSpacing: '-0.01em' }}>Resumo Financeiro</h3>

            <div className="flex flex-col gap-6 md:gap-9">
              <div>
                <p className="tv-label mb-2">Patrimônio Atual</p>
                <p className="text-4xl md:text-5xl font-semibold text-gray-800 tv-num">
                  <AnimatedNumber value={totalBalance} prefix="R$ " decimals={2} isPrivate={isPrivate} />
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl transition-transform duration-200 hover:-translate-y-0.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="tv-label mb-2">Econ. Mensal Estimada</p>
                  <p className={`text-xl md:text-2xl font-semibold ${forecastColor}`}>
                    <AnimatedNumber value={finalForecast} prefix="R$ " decimals={2} isPrivate={isPrivate} />
                  </p>
                </div>
                <div className="p-4 rounded-2xl transition-transform duration-200 hover:-translate-y-0.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="tv-label mb-2">Renda Poupada</p>
                  <p className="text-xl md:text-2xl font-semibold text-gray-800 tv-num">
                    {isPrivate ? '••%' : `${Math.max(0, Math.round(savingsRate))}%`}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-gray-500" style={{ letterSpacing: '-0.01em' }}>Você está economizando <span className={`font-semibold ${forecastColorBold}`}>{Math.max(0, Math.round(savingsRate))}%</span> da sua renda mensal.</span>
                </div>
                <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%`, background: isNegative ? 'linear-gradient(90deg, #5a3a90 0%, #a78bfa 100%)' : 'linear-gradient(90deg, #059669 0%, #34d399 100%)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <div className="clean-card p-8 md:p-10 animate-fade-in delay-200 text-center flex-1 flex flex-col items-center justify-center relative overflow-hidden min-h-[250px]">
            <h3 className="text-sm font-semibold text-gray-800 mb-6 md:mb-8" style={{ letterSpacing: '-0.01em' }}>Score de Saúde Financeira</h3>

            <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center mb-6">
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e5e7eb" strokeWidth="7" />
                <circle
                  className="progress-ring__circle"
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke={healthScore > 60 ? "#34d399" : "#ef4444"}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * healthScore) / 100}
                />
              </svg>
              <span className="text-4xl md:text-5xl font-semibold text-gray-800 tv-num">{isPrivate ? '••' : `${Math.round(healthScore)}`}</span>
            </div>
            <p className="text-xs text-gray-500 px-2 md:px-4 leading-relaxed" style={{ letterSpacing: '-0.005em' }}>
              {healthScore > 60 ? 'Finanças equilibradas e organizadas.' : 'Cuidado, proporção perigosa.'}
            </p>
          </div>
        </div>
      </div>

      <div className="clean-card p-6 md:p-8 animate-fade-in delay-300 w-full mb-8 md:mb-12">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 md:mb-8 border-b border-gray-50 pb-4 gap-4 sm:gap-0">
          <h3 className="text-sm font-semibold text-gray-800" style={{ letterSpacing: '-0.01em' }}>Suas Metas</h3>
          <button onClick={() => setGoalModal(true)} className="flex items-center justify-center gap-2 text-[11px] font-semibold bg-red-50 text-red-500 px-4 py-2.5 sm:py-2 rounded-xl hover:bg-red-100 transition-colors w-full sm:w-auto" style={{ letterSpacing: '0.04em' }}>
            <Plus className="w-3.5 h-3.5"/> Nova Meta
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {gList.length === 0 ? (
            <p className="text-gray-400 text-sm col-span-full text-center py-6" style={{ letterSpacing: '-0.01em' }}>Adicione dados para visualizar suas metas.</p>
          ) : (
            gList.map(goal => {
              const perc = Math.min(((goal.current || 0) / (goal.target || 1)) * 100, 100);
              return (
                <div key={goal.id} className="flex items-center gap-4 p-4 rounded-2xl flex-col min-[400px]:flex-row text-center min-[400px]:text-left relative group overflow-hidden w-full shrink-0 transition-all duration-200 hover:-translate-y-0.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.085)' }}>
                  <button onClick={() => {
                    setGoals(gList.filter(g => g.id !== goal.id));
                    showToast('Meta removida!');
                  }} className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                    <Trash2 className="w-3.5 h-3.5"/>
                  </button>

                  <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e5e7eb" strokeWidth="7" />
                      <circle className="progress-ring__circle" cx="50" cy="50" r="40" fill="transparent" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * perc) / 100} />
                    </svg>
                    <span className="text-xs md:text-sm font-bold text-gray-700 tv-num">{isPrivate ? '••' : `${Math.round(perc)}%`}</span>
                  </div>
                  <div className="flex flex-col w-full items-center min-[400px]:items-start gap-1">
                    <span className="text-sm font-semibold text-gray-800" style={{ letterSpacing: '-0.01em' }}>{goal.name}</span>
                    <span className="text-[10px] text-gray-400 tv-num">Meta: R$ {isPrivate ? '••••' : (goal.target || 0).toLocaleString('pt-BR')}</span>
                    <span className="text-[10px] text-gray-500 font-semibold tv-num">Atual: R$ {isPrivate ? '••••' : (goal.current || 0).toLocaleString('pt-BR')}</span>
                    <button onClick={() => { setAddGoalValueModal(goal); setAddGoalAmount(''); }} className="mt-2 w-full py-2 text-gray-500 hover:text-gray-300 text-[10px] font-semibold rounded-xl transition-colors" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', letterSpacing: '0.04em' }}>Adicionar valor</button>
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

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} user={session?.user} />

      {/* Wrapper Principal Sensível ao Tema */}
      <div className="flex h-screen w-full overflow-hidden relative theme-dark" style={{backgroundColor: '#000000'}}>


        {/* Área Principal */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto relative">
          
          {/* Header + Nav Superior */}
          <div className="sticky top-0 z-30">
            <header
              style={{ background: '#000', borderBottom: '1px solid #1a1a1a' }}
              className="px-5 md:px-8 py-4 flex justify-between items-center"
            >
              {/* Título */}
              <h1
                onClick={() => setActiveTab('home')}
                style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', letterSpacing: '-0.02em', lineHeight: 1, cursor: 'pointer' }}
              >
                <span style={{ color: '#ffffff' }}>Tito</span>
                <span style={{ color: '#6d4aad' }}>Vest</span>
              </h1>

              {/* Ações direita */}
              <div className="flex items-center gap-3">
                {/* Privacidade */}
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  style={{ color: '#888', transition: 'color 0.18s ease' }}
                  className="p-2 rounded-full hover:text-white"
                >
                  {isPrivate ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>

                {/* Menu hambúrguer → abre sidebar */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  style={{ color: '#888', transition: 'color 0.18s ease' }}
                  className="p-2 rounded-full hover:text-white flex flex-col gap-[5px] items-center justify-center"
                  aria-label="Menu"
                >
                  <span style={{ display: 'block', width: '20px', height: '1.5px', background: 'currentColor', borderRadius: '2px' }} />
                  <span style={{ display: 'block', width: '20px', height: '1.5px', background: 'currentColor', borderRadius: '2px' }} />
                  <span style={{ display: 'block', width: '20px', height: '1.5px', background: 'currentColor', borderRadius: '2px' }} />
                </button>
              </div>
            </header>

            {/* Nav Scroll Horizontal */}
            <nav style={{ background: '#000' }} className="px-4 py-2.5">
              <div
                className="flex gap-2.5 overflow-x-auto scrollbar-none"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {[
                  { id: 'home',    icon: Home,   label: 'Início' },
                  { id: 'wallet',  icon: Wallet, label: 'Carteira' },
                  { id: 'profile', icon: User,   label: 'Perfil' },
                  { id: 'history', icon: Clock,  label: 'Histórico' },
                ].map((item, idx, arr) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={(e) => {
                        if (item.id === 'history') setHistoryFilter('all');
                        setActiveTab(item.id);
                        if (idx > 0 && idx < arr.length - 1) {
                          e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                        }
                      }}
                      style={{
                        background: isActive ? 'rgba(61, 34, 112, 0.88)' : 'transparent',
                        border: isActive ? '1px solid rgba(109, 74, 173, 0.6)' : '1px solid #2a2a2a',
                        color: isActive ? '#ffffff' : '#606060',
                        transition: 'background 0.22s ease, border-color 0.22s ease, color 0.22s ease',
                        flexShrink: 0,
                      }}
                      className="flex items-center gap-2 px-5 py-1.5 rounded-full whitespace-nowrap text-sm font-medium"
                    >
                      <item.icon
                        className="w-4 h-4"
                        style={{ strokeWidth: isActive ? 2 : 1.5 }}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          <div className="px-4 py-5 pb-10 md:px-6 md:py-7 md:pb-14 max-w-7xl mx-auto w-full flex-1 flex flex-col">
            {renderContent()}
          </div>
        </main>


        {/* BOTTOM SHEET: Definições e Reset */}
        {settingsModal && (
          <BottomSheet onClose={() => setSettingsModal(false)}>
            <div className="px-6 pb-8 pt-3 space-y-5">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2.5" style={{ letterSpacing: '-0.01em' }}>
                <Settings className="w-4 h-4 text-gray-500" style={{ opacity: 0.7 }}/> Definições
              </h3>
              <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: 'rgba(109,74,173,0.10)', border: '1px solid rgba(109,74,173,0.22)' }}>
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" style={{ opacity: 0.9 }}/>
                <div>
                  <h4 className="text-sm font-semibold text-red-400 mb-1" style={{ letterSpacing: '-0.01em' }}>Zona de Perigo</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">Apagar os dados irá remover permanentemente todo o histórico, metas e informações de todos os meses.</p>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                <button onClick={handleLogout} className="w-full py-3 text-white text-[11px] font-semibold rounded-2xl transition-all hover:opacity-85 flex items-center justify-center gap-2" style={{ background: '#6d4aad', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  <LogOut className="w-3.5 h-3.5" /> Sair da conta
                </button>
                <button onClick={handleResetData} className="w-full py-3 text-[11px] font-semibold rounded-2xl transition-all hover:opacity-85" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Apagar todos os dados</button>
                <button onClick={() => setSettingsModal(false)} className="w-full py-3 text-gray-500 text-[11px] font-semibold rounded-2xl transition-colors" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Cancelar</button>
              </div>
            </div>
          </BottomSheet>
        )}

        {/* BOTTOM SHEET: Confirmação de Salário */}
        {salaryConfirmModal !== null && (
          <BottomSheet onClose={() => setSalaryConfirmModal(null)}>
            <div className="px-6 pb-8 pt-3 space-y-5">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-800" style={{ letterSpacing: '-0.015em' }}>Adicionar salário como transação?</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Deseja registar esse valor como entrada nas transações recentes?</p>
              </div>
              <div className="flex flex-col gap-2.5">
                <button onClick={() => handleSalaryWithTransaction(salaryConfirmModal)} className="w-full py-3 text-white text-[11px] font-semibold rounded-2xl transition-all hover:opacity-85" style={{ background: '#6d4aad', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sim, adicionar</button>
                <button onClick={() => handleSalaryOnly(salaryConfirmModal)} className="w-full py-3 text-gray-500 text-[11px] font-semibold rounded-2xl transition-colors" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Não</button>
              </div>
            </div>
          </BottomSheet>
        )}

        {/* MODAL: Nova Transação */}
        {/* BOTTOM SHEET: Nova Transação */}
        {txModal && (
          <BottomSheet onClose={() => setTxModal(null)}>
            <div className="px-6 pb-8 pt-3 space-y-5">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2.5" style={{ letterSpacing: '-0.015em' }}>
                {txModal === 'in' ? <ArrowDownRight className="w-4 h-4 text-gray-500" style={{ opacity: 0.8 }}/> : <ArrowUpRight className="w-4 h-4 text-red-400" />}
                Registar {txModal === 'in' ? 'Entrada' : 'Saída'}
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="tv-label block ml-1">Valor (R$)</label>
                  <input type="number" value={newTx.amount || ''} onChange={e => setNewTx({...newTx, amount: e.target.value})} placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none transition-all text-gray-800 font-semibold text-sm tv-num" />
                </div>
                <div className="space-y-2">
                  <label className="tv-label block ml-1">Descrição</label>
                  <input type="text" value={newTx.desc || ''} onChange={e => setNewTx({...newTx, desc: e.target.value})} placeholder="Ex: Salário, Lanche..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none transition-all text-gray-800 text-sm" />
                </div>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => setTxModal(null)} className="flex-1 py-3 text-gray-500 text-[11px] font-semibold rounded-2xl transition-colors" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Cancelar</button>
                <button onClick={handleAddTx} className="flex-1 py-3 text-white text-[11px] font-semibold rounded-2xl transition-all hover:opacity-85" style={{ background: txModal === 'in' ? 'rgba(255,255,255,0.16)' : '#6d4aad', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Salvar</button>
              </div>
            </div>
          </BottomSheet>
        )}

        {/* BOTTOM SHEET: Novo Gasto Fixo */}
        {fixedCostModal && (
          <BottomSheet onClose={() => setFixedCostModal(false)}>
            <div className="px-6 pb-8 pt-3 space-y-5">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2.5" style={{ letterSpacing: '-0.015em' }}>
                <CreditCard className="w-4 h-4 text-gray-500" style={{ opacity: 0.7 }}/> Novo Gasto Fixo
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="tv-label block ml-1">Nome da Conta</label>
                  <input type="text" value={newFixedCost.name || ''} onChange={e => setNewFixedCost({...newFixedCost, name: e.target.value})} placeholder="Ex: Academia" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none transition-all text-gray-800 text-sm" />
                </div>
                <div className="flex gap-3">
                  <div className="space-y-2 flex-1">
                    <label className="tv-label block ml-1">Valor</label>
                    <input type="number" value={newFixedCost.amount || ''} onChange={e => setNewFixedCost({...newFixedCost, amount: e.target.value})} placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none transition-all text-gray-800 font-semibold text-sm tv-num" />
                  </div>
                  <div className="space-y-2 w-1/3">
                    <label className="tv-label block ml-1">Dia</label>
                    <input type="text" value={newFixedCost.due || ''} onChange={e => setNewFixedCost({...newFixedCost, due: e.target.value})} placeholder="15" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none transition-all text-gray-800 text-center text-sm" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => setFixedCostModal(false)} className="flex-1 py-3 text-gray-500 text-[11px] font-semibold rounded-2xl transition-colors" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Cancelar</button>
                <button onClick={handleAddFixedCost} className="flex-1 py-3 text-white text-[11px] font-semibold rounded-2xl transition-all hover:opacity-85" style={{ background: '#6d4aad', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Adicionar</button>
              </div>
            </div>
          </BottomSheet>
        )}

        {/* BOTTOM SHEET: Reserva de Emergência */}
        {emergencyModal && (
          <BottomSheet onClose={() => setEmergencyModal(false)}>
            <div className="px-6 pb-8 pt-3 space-y-5">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2.5" style={{ letterSpacing: '-0.015em' }}>
                <ShieldCheck className="w-4 h-4 text-emerald-500" style={{ opacity: 0.9 }}/> Reserva de Emergência
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="tv-label block ml-1">Valor Guardado (R$)</label>
                  <input type="number" value={newEmergency.current || ''} onChange={e => setNewEmergency({...newEmergency, current: e.target.value})} placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none transition-all text-gray-800 font-semibold text-sm tv-num" />
                </div>
                <div className="space-y-2">
                  <label className="tv-label block ml-1">Objetivo (R$)</label>
                  <input type="number" value={newEmergency.target || ''} onChange={e => setNewEmergency({...newEmergency, target: e.target.value})} placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none transition-all text-gray-800 font-semibold text-sm tv-num" />
                </div>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => setEmergencyModal(false)} className="flex-1 py-3 text-gray-500 text-[11px] font-semibold rounded-2xl transition-colors" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Cancelar</button>
                <button onClick={handleSaveEmergency} className="flex-1 py-3 text-white text-[11px] font-semibold rounded-2xl transition-all hover:opacity-85" style={{ background: '#6d4aad', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Salvar</button>
              </div>
            </div>
          </BottomSheet>
        )}

        {/* BOTTOM SHEET: Novo Investimento Externo */}
        {extInvModal && (
          <BottomSheet onClose={() => setExtInvModal(false)}>
            <div className="px-6 pb-8 pt-3 space-y-5">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2.5" style={{ letterSpacing: '-0.015em' }}>
                <DollarSign className="w-4 h-4 text-gray-500" style={{ opacity: 0.7 }}/> Investimento Externo
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="tv-label block ml-1">Tipo</label>
                  <select value={newExtInv.type} onChange={e => setNewExtInv({...newExtInv, type: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none transition-all text-gray-800 appearance-none text-sm">
                    <option>Dólar (USD)</option>
                    <option>Euro (EUR)</option>
                    <option>Outros</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="tv-label block ml-1">Descrição (Opcional)</label>
                  <input type="text" value={newExtInv.name || ''} onChange={e => setNewExtInv({...newExtInv, name: e.target.value})} placeholder="Ex: Conta Nomad" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none transition-all text-gray-800 text-sm" />
                </div>
                <div className="flex gap-3">
                  <div className="space-y-2 flex-1">
                    <label className="tv-label block ml-1">Valor na Moeda</label>
                    <input type="number" value={newExtInv.amount || ''} onChange={e => setNewExtInv({...newExtInv, amount: e.target.value})} placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none transition-all text-gray-800 font-semibold text-sm tv-num" />
                  </div>
                  <div className="space-y-2 w-1/3">
                    <label className="tv-label block ml-1">Cotação R$</label>
                    <input type="number" value={newExtInv.rate || ''} onChange={e => setNewExtInv({...newExtInv, rate: e.target.value})} placeholder="1.00" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none transition-all text-gray-800 text-center text-sm tv-num" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => setExtInvModal(false)} className="flex-1 py-3 text-gray-500 text-[11px] font-semibold rounded-2xl transition-colors" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Cancelar</button>
                <button onClick={handleAddExtInvestment} className="flex-1 py-3 text-white text-[11px] font-semibold rounded-2xl transition-all hover:opacity-85" style={{ background: '#6d4aad', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Adicionar</button>
              </div>
            </div>
          </BottomSheet>
        )}

        {/* BOTTOM SHEET: Nova Meta */}
        {goalModal && (
          <BottomSheet onClose={() => setGoalModal(false)}>
            <div className="px-6 pb-8 pt-3 space-y-5">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2.5" style={{ letterSpacing: '-0.015em' }}>
                <Target className="w-4 h-4 text-red-400" style={{ opacity: 0.9 }}/> Nova Meta
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="tv-label block ml-1">Nome da Meta</label>
                  <input type="text" value={newGoal.name || ''} onChange={e => setNewGoal({...newGoal, name: e.target.value})} placeholder="Ex: Comprar Carro" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none transition-all text-gray-800 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="tv-label block ml-1">Valor Alvo (R$)</label>
                  <input type="number" value={newGoal.target || ''} onChange={e => setNewGoal({...newGoal, target: e.target.value})} placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none transition-all text-gray-800 font-semibold text-sm tv-num" />
                </div>
                <div className="space-y-2">
                  <label className="tv-label block ml-1">Já Guardado (Opcional)</label>
                  <input type="number" value={newGoal.current || ''} onChange={e => setNewGoal({...newGoal, current: e.target.value})} placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none transition-all text-gray-800 font-semibold text-sm tv-num" />
                </div>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => setGoalModal(false)} className="flex-1 py-3 text-gray-500 text-[11px] font-semibold rounded-2xl transition-colors" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Cancelar</button>
                <button onClick={handleAddGoal} className="flex-1 py-3 text-white text-[11px] font-semibold rounded-2xl transition-all hover:opacity-85" style={{ background: '#6d4aad', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Criar Meta</button>
              </div>
            </div>
          </BottomSheet>
        )}

        {/* BOTTOM SHEET: Adicionar Valor à Meta */}
        {addGoalValueModal && (
          <BottomSheet onClose={() => setAddGoalValueModal(null)}>
            <div className="px-6 pb-8 pt-3 space-y-5">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2.5" style={{ letterSpacing: '-0.015em' }}>
                <Plus className="w-4 h-4 text-emerald-500" style={{ opacity: 0.9 }}/> Adicionar Valor
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
                  <p className="tv-label mb-1.5">Meta: {addGoalValueModal.name}</p>
                  <p className="text-sm font-semibold text-gray-800 tv-num">Atual: R$ {(addGoalValueModal.current || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                </div>
                <div className="space-y-2">
                  <label className="tv-label block ml-1">Valor a adicionar (R$)</label>
                  <input type="number" value={addGoalAmount} onChange={e => setAddGoalAmount(e.target.value)} placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none transition-all text-gray-800 font-semibold text-sm tv-num" />
                </div>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => setAddGoalValueModal(null)} className="flex-1 py-3 text-gray-500 text-[11px] font-semibold rounded-2xl transition-colors" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Cancelar</button>
                <button onClick={handleAddValueToGoal} className="flex-1 py-3 text-white text-[11px] font-semibold rounded-2xl transition-all hover:opacity-85" style={{ background: '#6d4aad', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Confirmar</button>
              </div>
            </div>
          </BottomSheet>
        )}

        {/* TOAST Notification */}
        {toast && (
          <div className="fixed bottom-20 md:bottom-10 right-4 md:right-8 z-50 animate-fade-in">
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl" style={{ background: 'rgba(16,16,16,0.96)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 8px 40px rgba(0,0,0,0.60)' }}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" style={{ opacity: 0.9 }} />
              <span className="text-[11px] font-semibold text-white" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>{toast}</span>
            </div>
          </div>
        )}

      </div>
    </>
  );
}