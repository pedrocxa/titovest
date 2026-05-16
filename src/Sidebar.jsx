import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, LogOut, ChevronRight, ChevronLeft, FileText, HelpCircle } from 'lucide-react';
import { supabase } from './lib/supabase';
import panteraImg from './assets/pantera.png';

// ─── Animation variants ───────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.28 } },
  exit:   { opacity: 0, transition: { duration: 0.22, delay: 0.06 } },
};

const panelVariants = {
  hidden:  { x: '100%' },
  visible: { x: 0, transition: { type: 'spring', damping: 32, stiffness: 320, mass: 0.9 } },
  exit:    { x: '100%', transition: { type: 'spring', damping: 38, stiffness: 380, mass: 0.8 } },
};

const bannerVariants = {
  hidden:  { opacity: 0, y: -18 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.24 } },
};

const itemVariants = {
  hidden:  { opacity: 0, x: 22 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] } },
};

const modalVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: 14, transition: { duration: 0.18 } },
};

// Chevron nudges right when the parent row is hovered
const chevronVariants = {
  rest:  { x: 0, opacity: 0.22 },
  hover: { x: 3, opacity: 0.50 },
};

// ─── Shared input style ───────────────────────────────────────────────────────

const inputStyle = {
  padding: '12px 14px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '14px',
  fontFamily: "'Manrope', sans-serif",
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.18s ease, background 0.18s ease',
};

// ─── Shared modal shell ───────────────────────────────────────────────────────

function ModalShell({ onBack, title, children }) {
  return (
    <motion.div
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: '#000000',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Manrope', sans-serif",
        overflowY: 'auto',
        overscrollBehavior: 'contain',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: '20px 20px 0' }}>
        <motion.button
          onClick={onBack}
          whileHover={{ color: '#ffffff' }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.15 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6B7280', fontSize: '13px', fontWeight: 500,
            fontFamily: "'Manrope', sans-serif",
            padding: '8px 0',
          }}
        >
          <ChevronLeft size={16} strokeWidth={1.8} />
          Voltar
        </motion.button>
      </div>

      <div style={{ padding: '28px 24px 20px' }}>
        <h2 style={{
          fontSize: '22px', fontWeight: 600, color: '#ffffff',
          letterSpacing: '-0.03em', margin: 0,
          fontFamily: "'Manrope', sans-serif",
        }}>
          {title}
        </h2>
      </div>

      <div style={{ flex: 1, padding: '0 20px 52px' }}>
        {children}
      </div>
    </motion.div>
  );
}

// ─── Account modal ─────────────────────────────────────────────────────────────

function AccountModal({ onBack, user, onLogout }) {
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [pwLoading,  setPwLoading]  = useState(false);
  const [pwMsg,      setPwMsg]      = useState(null);

  const name    = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';
  const email   = user?.email || '—';
  const initial = name.charAt(0).toUpperCase();

  const handleChangePassword = async () => {
    setPwMsg(null);
    if (newPw.length < 6) {
      setPwMsg({ ok: false, text: 'A senha deve ter no mínimo 6 caracteres.' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ ok: false, text: 'As senhas não coincidem.' });
      return;
    }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) {
      setPwMsg({ ok: false, text: 'Erro ao atualizar senha. Tente novamente.' });
    } else {
      setPwMsg({ ok: true, text: 'Senha atualizada com sucesso.' });
      setNewPw('');
      setConfirmPw('');
    }
    setPwLoading(false);
  };

  const infoRows = [
    { label: 'Nome completo',      value: name,  dim: false },
    { label: 'Email',              value: email, dim: false },
    { label: 'Data de nascimento', value: 'Não configurado', dim: true },
  ];

  return (
    <ModalShell onBack={onBack} title="Conta">
      {/* ── Identity header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
          background: 'rgba(109,74,173,0.20)', border: '1px solid rgba(109,74,173,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', fontWeight: 600, color: '#a78bfa',
          fontFamily: "'Manrope', sans-serif",
        }}>
          {initial}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontSize: '16px', fontWeight: 600, color: '#ffffff', margin: 0,
            letterSpacing: '-0.02em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {name}
          </p>
          <p style={{
            fontSize: '12px', color: '#4B5563', margin: '3px 0 0', letterSpacing: '0.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {email}
          </p>
        </div>
      </div>

      {/* ── Personal info ── */}
      <p style={{
        fontSize: '10px', fontWeight: 600, color: '#374151',
        letterSpacing: '0.10em', textTransform: 'uppercase',
        margin: '0 0 10px', fontFamily: "'Outfit', sans-serif",
      }}>
        Informações Pessoais
      </p>
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '8px', overflow: 'hidden', marginBottom: '24px',
      }}>
        {infoRows.map((row, i) => (
          <div key={i} style={{
            padding: '13px 16px',
            borderBottom: i < infoRows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}>
            <p style={{
              fontSize: '10px', color: '#4B5563', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              margin: '0 0 4px', fontFamily: "'Outfit', sans-serif",
            }}>
              {row.label}
            </p>
            <p style={{
              fontSize: '13px', fontWeight: 500, margin: 0, letterSpacing: '-0.005em',
              color: row.dim ? '#374151' : '#e5e7eb',
            }}>
              {row.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Security ── */}
      <p style={{
        fontSize: '10px', fontWeight: 600, color: '#374151',
        letterSpacing: '0.10em', textTransform: 'uppercase',
        margin: '0 0 10px', fontFamily: "'Outfit', sans-serif",
      }}>
        Segurança
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
        <input
          type="password"
          placeholder="Nova senha"
          value={newPw}
          onChange={e => { setNewPw(e.target.value); setPwMsg(null); }}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Confirmar nova senha"
          value={confirmPw}
          onChange={e => { setConfirmPw(e.target.value); setPwMsg(null); }}
          style={inputStyle}
        />
        {pwMsg && (
          <p style={{
            fontSize: '12px', margin: '2px 0 0', textAlign: 'center', lineHeight: 1.5,
            color: pwMsg.ok ? '#34d399' : '#ef4444',
          }}>
            {pwMsg.text}
          </p>
        )}
        <motion.button
          onClick={handleChangePassword}
          disabled={pwLoading}
          whileHover={!pwLoading ? { opacity: 0.88 } : {}}
          whileTap={!pwLoading ? { scale: 0.98 } : {}}
          style={{
            marginTop: '4px', padding: '13px',
            background: pwLoading ? 'rgba(109,74,173,0.5)' : '#6d4aad',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontSize: '12px', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            cursor: pwLoading ? 'not-allowed' : 'pointer',
            fontFamily: "'Manrope', sans-serif",
          }}
        >
          {pwLoading ? 'Salvando...' : 'Salvar nova senha'}
        </motion.button>
      </div>

      {/* ── Logout ── */}
      {onLogout && (
        <motion.button
          onClick={onLogout}
          whileHover={{ backgroundColor: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.30)' }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          style={{
            width: '100%', padding: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.18)',
            borderRadius: '8px',
            color: '#ef4444', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em',
            fontFamily: "'Manrope', sans-serif",
          }}
        >
          <LogOut size={15} strokeWidth={1.7} />
          Sair da conta
        </motion.button>
      )}
    </ModalShell>
  );
}

// ─── Phone modal ──────────────────────────────────────────────────────────────

function PhoneModal({ onBack }) {
  return (
    <ModalShell onBack={onBack} title="Número de Telefone">
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '8px', padding: '20px', marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: '16px',
      }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '8px', flexShrink: 0,
          background: 'rgba(109,74,173,0.14)', border: '1px solid rgba(109,74,173,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Smartphone size={19} strokeWidth={1.5} color="#a78bfa" />
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
            Não configurado
          </p>
          <p style={{ fontSize: '11px', color: '#4B5563', margin: '3px 0 0', letterSpacing: '0.01em' }}>
            Nenhum número vinculado à conta
          </p>
        </div>
      </div>
      <p style={{ fontSize: '12px', color: '#374151', lineHeight: 1.65, letterSpacing: '0.01em' }}>
        A verificação por número de telefone estará disponível em breve, permitindo maior segurança e recuperação de conta.
      </p>
    </ModalShell>
  );
}

// ─── Terms modal ─────────────────────────────────────────────────────────────

function TermsModal({ onBack }) {
  const sections = [
    { title: 'Uso do Aplicativo',         body: 'O TitoVest é uma ferramenta de gestão financeira pessoal destinada exclusivamente ao uso individual e não comercial. O acesso é pessoal e intransferível.' },
    { title: 'Responsabilidade',          body: 'Os dados financeiros inseridos são de total responsabilidade do usuário. A plataforma não valida nem confirma a veracidade das informações registradas.' },
    { title: 'Armazenamento',             body: 'Seus dados são armazenados com criptografia em trânsito e repouso. Não compartilhamos informações pessoais com terceiros.' },
    { title: 'Não Constitui Consultoria', body: 'As informações são meramente organizacionais. O TitoVest não oferece consultoria financeira ou de investimentos.' },
    { title: 'Alterações nos Termos',     body: 'Estes termos podem ser atualizados periodicamente. O uso continuado implica na aceitação dos novos termos.' },
  ];

  return (
    <ModalShell onBack={onBack} title="Termos de Uso">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {sections.map((s, i) => (
          <div key={i} style={{
            padding: '16px 0',
            borderBottom: i < sections.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 7px', fontFamily: "'Outfit', sans-serif" }}>
              {s.title}
            </p>
            <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.7, margin: 0, letterSpacing: '0.005em' }}>
              {s.body}
            </p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '11px', color: '#1f2937', marginTop: '28px', letterSpacing: '0.01em', lineHeight: 1.6 }}>
        Última atualização: maio de 2026 · TitoVest © 2026
      </p>
    </ModalShell>
  );
}

// ─── Support modal ────────────────────────────────────────────────────────────

function SupportModal({ onBack }) {
  const faqs = [
    { q: 'Como redefinir minha senha?',  a: 'Acesse "Conta" na sidebar e utilize o campo de alteração de senha. Ou na tela de login, use a recuperação por email.' },
    { q: 'Meus dados são seguros?',       a: 'Sim. Utilizamos Supabase com criptografia em trânsito e repouso para todos os seus dados.' },
    { q: 'O aplicativo é gratuito?',      a: 'Sim, o TitoVest é gratuito durante o período de acesso antecipado.' },
  ];

  return (
    <ModalShell onBack={onBack} title="Suporte">
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '8px', padding: '18px 20px', marginBottom: '12px',
      }}>
        <p style={{ fontSize: '10px', fontWeight: 600, color: '#374151', letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 8px', fontFamily: "'Outfit', sans-serif" }}>
          Email
        </p>
        <p style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
          titovestfinance@gmail.com
        </p>
        <p style={{ fontSize: '11px', color: '#4B5563', margin: '4px 0 0', letterSpacing: '0.01em' }}>
          Respondemos em até 48 horas úteis
        </p>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '8px', overflow: 'hidden', marginBottom: '24px',
      }}>
        {faqs.map((item, i) => (
          <div key={i} style={{
            padding: '15px 20px',
            borderBottom: i < faqs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#d1d5db', margin: '0 0 5px', letterSpacing: '-0.01em' }}>
              {item.q}
            </p>
            <p style={{ fontSize: '12px', color: '#4B5563', margin: 0, lineHeight: 1.65, letterSpacing: '0.005em' }}>
              {item.a}
            </p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '12px', color: '#374151', lineHeight: 1.65, letterSpacing: '0.01em' }}>
        Para questões técnicas ou sugestões, entre em contato pelo email acima.
      </p>
    </ModalShell>
  );
}

// ─── Nav row — clean line with animated chevron ───────────────────────────────

function NavRow({ label, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      animate="rest"
      transition={{ duration: 0.18 }}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center',
        padding: '17px 24px',
        background: 'transparent', border: 'none',
        cursor: 'pointer', textAlign: 'left',
      }}
    >
      <span style={{
        flex: 1,
        fontSize: '15px', fontWeight: 500, color: '#ffffff',
        letterSpacing: '-0.015em', fontFamily: "'Manrope', sans-serif",
      }}>
        {label}
      </span>
      <motion.span
        variants={chevronVariants}
        transition={{ duration: 0.18 }}
        style={{ display: 'flex', alignItems: 'center', color: '#ffffff' }}
      >
        <ChevronRight size={15} strokeWidth={1.5} />
      </motion.span>
    </motion.button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Sidebar({ isOpen, onClose, onLogout, user }) {
  const [accountModal, setAccountModal] = useState(false);
  const [phoneModal,   setPhoneModal]   = useState(false);
  const [termsModal,   setTermsModal]   = useState(false);
  const [supportModal, setSupportModal] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setAccountModal(false);
      setPhoneModal(false);
      setTermsModal(false);
      setSupportModal(false);
    }
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="sidebar-backdrop"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={onClose}
              style={{
                position: 'fixed', inset: 0, zIndex: 70,
                background: 'rgba(0,0,0,0.82)',
                backdropFilter: 'blur(7px)',
                WebkitBackdropFilter: 'blur(7px)',
              }}
            />

            {/* Panel */}
            <motion.div
              key="sidebar-panel"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'fixed', inset: 0, zIndex: 71,
                background: '#000000',
                display: 'flex', flexDirection: 'column',
                fontFamily: "'Manrope', sans-serif",
                overflowY: 'auto',
                overscrollBehavior: 'contain',
              }}
            >
              {/* ── Close ── */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 20px 6px' }}>
                <motion.button
                  onClick={onClose}
                  aria-label="Fechar menu"
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ opacity: 0.7 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '44px', height: '44px',
                    background: 'transparent', border: 'none',
                    color: '#ffffff', cursor: 'pointer',
                    flexShrink: 0, padding: 0,
                  }}
                >
                  <X size={22} strokeWidth={1.6} />
                </motion.button>
              </div>

              {/* ── Banner ── */}
              <motion.div
                variants={bannerVariants}
                initial="hidden"
                animate="visible"
                style={{ padding: '10px 20px 24px' }}
              >
                <img
                  src={panteraImg}
                  alt="TitoVest"
                  style={{
                    width: '100%', borderRadius: '8px',
                    display: 'block', objectFit: 'cover', objectPosition: 'center',
                  }}
                />
              </motion.div>

              {/* ── Nav rows ── */}
              <motion.nav
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <NavRow label="Acessar conta"      onClick={() => setAccountModal(true)} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 24px' }} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <NavRow label="Número de Telefone" onClick={() => setPhoneModal(true)} />
                </motion.div>
              </motion.nav>

              {/* ── Spacer ── */}
              <div style={{ flex: 1 }} />

              {/* ── Footer ── */}
              <div style={{ padding: '0 20px 20px' }}>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '16px' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <motion.button
                    onClick={() => setTermsModal(true)}
                    whileHover={{ color: '#9CA3AF', borderColor: 'rgba(255,255,255,0.10)' }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      flex: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                      padding: '10px',
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(255,255,255,0.055)',
                      borderRadius: '8px',
                      color: '#4B5563',
                      fontSize: '11px', fontWeight: 500, letterSpacing: '0.02em',
                      cursor: 'pointer', fontFamily: "'Manrope', sans-serif",
                    }}
                  >
                    <FileText size={11} strokeWidth={1.6} />
                    Termos de Uso
                  </motion.button>
                  <motion.button
                    onClick={() => setSupportModal(true)}
                    whileHover={{ color: '#9CA3AF', borderColor: 'rgba(255,255,255,0.10)' }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      flex: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                      padding: '10px',
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(255,255,255,0.055)',
                      borderRadius: '8px',
                      color: '#4B5563',
                      fontSize: '11px', fontWeight: 500, letterSpacing: '0.02em',
                      cursor: 'pointer', fontFamily: "'Manrope', sans-serif",
                    }}
                  >
                    <HelpCircle size={11} strokeWidth={1.6} />
                    Suporte
                  </motion.button>
                </div>
              </div>

              {/* ── Copyright ── */}
              <div style={{ padding: '0 24px 48px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: '#1f2937', letterSpacing: '0.02em' }}>
                  TitoVest © 2026
                </p>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Modals (zIndex 80, above sidebar) ── */}
      <AnimatePresence>
        {accountModal && (
          <AccountModal
            key="account-modal"
            onBack={() => setAccountModal(false)}
            user={user}
            onLogout={onLogout}
          />
        )}
        {phoneModal && (
          <PhoneModal key="phone-modal" onBack={() => setPhoneModal(false)} />
        )}
        {termsModal && (
          <TermsModal key="terms-modal" onBack={() => setTermsModal(false)} />
        )}
        {supportModal && (
          <SupportModal key="support-modal" onBack={() => setSupportModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
