import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, LogOut, ChevronRight, ChevronLeft, FileText, HelpCircle, Edit2, Zap, Landmark, User, Settings, CreditCard, Key, Lock, Fingerprint, AlertCircle, MessageSquare } from 'lucide-react';
import { supabase } from './lib/supabase';

// ─── Animation variants ───────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.28 } },
  exit:   { opacity: 0, transition: { duration: 0.22, delay: 0.06 } },
};

const panelVariants = {
  hidden:  { x: '100%' },
  visible: { x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit:    { x: '100%', transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
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
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: 8, transition: { duration: 0.22 } },
};

// Chevron nudges right when the parent row is hovered
const chevronVariants = {
  rest:  { x: 0, opacity: 0.3 },
  hover: { x: 2, opacity: 0.8 },
};

// ─── Shared input style ───────────────────────────────────────────────────────

const inputStyle = {
  padding: '14px 16px',
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '4px',
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
      <div style={{ display: 'flex', alignItems: 'center', padding: '24px 24px 0' }}>
        <motion.button
          onClick={onBack}
          aria-label="Voltar"
          whileTap={{ scale: 0.95 }}
          whileHover={{ opacity: 0.7 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', borderRadius: '50%',
            background: '#000000', border: '1px solid rgba(255,255,255,0.06)',
            color: '#ffffff', cursor: 'pointer',
            padding: 0,
          }}
        >
          <ChevronLeft size={14} strokeWidth={1.2} />
        </motion.button>
      </div>

      <div style={{ padding: '24px 24px 20px' }}>
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
  const [name, setName]       = useState(user?.user_metadata?.name || user?.email?.split('@')[0] || '');
  const [birthDate, setBirthDate] = useState(user?.user_metadata?.birthDate || '');
  const [cpf, setCpf]         = useState(user?.user_metadata?.cpf || '');
  const [phone, setPhone]     = useState(user?.user_metadata?.phone || '');
  const email                 = user?.email || '';
  
  const [saving, setSaving]   = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await supabase.auth.updateUser({
      data: { name, birthDate, cpf, phone }
    });
    setSaving(false);
  };

  return (
    <ModalShell onBack={onBack} title="Perfil">
      
      {/* ── Form ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500, letterSpacing: '0.02em', fontFamily: "'Manrope', sans-serif" }}>
            Nome completo
          </label>
          <input type="text" value={name} onChange={e=>setName(e.target.value)} onBlur={handleSave} style={inputStyle} className="titovest-input" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500, letterSpacing: '0.02em', fontFamily: "'Manrope', sans-serif" }}>
            Data de nascimento
          </label>
          <input type="text" placeholder="DD/MM/AAAA" value={birthDate} onChange={e=>setBirthDate(e.target.value)} onBlur={handleSave} style={inputStyle} className="titovest-input" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500, letterSpacing: '0.02em', fontFamily: "'Manrope', sans-serif" }}>
            CPF
          </label>
          <input type="text" placeholder="000.000.000-00" value={cpf} onChange={e=>setCpf(e.target.value)} onBlur={handleSave} style={inputStyle} className="titovest-input" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500, letterSpacing: '0.02em', fontFamily: "'Manrope', sans-serif" }}>
            Email
          </label>
          <input type="email" value={email} readOnly style={inputStyle} className="titovest-input" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500, letterSpacing: '0.02em', fontFamily: "'Manrope', sans-serif" }}>
            WhatsApp
          </label>
          <input type="text" placeholder="(00) 00000-0000" value={phone} onChange={e=>setPhone(e.target.value)} onBlur={handleSave} style={inputStyle} className="titovest-input" />
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
        {onLogout && (
          <motion.button
            onClick={onLogout}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{
              width: '100%', padding: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '4px',
              color: '#ffffff', cursor: 'pointer',
              fontSize: '13px', fontWeight: 500, letterSpacing: '0.01em',
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            <LogOut size={14} strokeWidth={1.5} color="#9CA3AF" />
            Sair da conta
          </motion.button>
        )}

        <motion.button
          onClick={() => setShowDeleteModal(true)}
          whileHover={{ color: '#ef4444' }}
          style={{
            background: 'transparent', border: 'none',
            color: '#6B7280', fontSize: '11px', fontWeight: 500,
            cursor: 'pointer', padding: '0',
            fontFamily: "'Manrope', sans-serif",
            letterSpacing: '0.02em'
          }}
        >
          Excluir conta
        </motion.button>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { ease: [0.22, 1, 0.36, 1], duration: 0.3 } }}
              exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
              style={{
                background: '#000000', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px', padding: '24px', width: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                fontFamily: "'Manrope', sans-serif"
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
                Excluir conta
              </h3>
              <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 24px', textAlign: 'center', lineHeight: 1.5 }}>
                Tem certeza? Esta ação é irreversível e todos os seus dados serão apagados.
              </p>
              
              <div style={{ display: 'flex', width: '100%', gap: '12px' }}>
                <motion.button
                  onClick={() => setShowDeleteModal(false)}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1, padding: '12px', background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px',
                    color: '#ffffff', fontSize: '13px', fontWeight: 500, cursor: 'pointer'
                  }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  onClick={() => { setShowDeleteModal(false); }}
                  whileHover={{ backgroundColor: 'rgba(239,68,68,0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1, padding: '12px', background: 'transparent',
                    border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px',
                    color: '#ef4444', fontSize: '13px', fontWeight: 500, cursor: 'pointer'
                  }}
                >
                  Excluir
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </ModalShell>
  );
}

// ─── Phone modal ──────────────────────────────────────────────────────────────

// ─── Placeholder Screen ───────────────────────────────────────────────────────

function PlaceholderScreen({ onBack }) {
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
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: '24px 24px 0' }}>
        <motion.button
          onClick={onBack}
          aria-label="Voltar"
          whileTap={{ scale: 0.95 }}
          whileHover={{ opacity: 0.7 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', borderRadius: '50%',
            background: '#000000', border: '1px solid rgba(255,255,255,0.06)',
            color: '#ffffff', cursor: 'pointer',
            padding: 0,
          }}
        >
          <ChevronLeft size={14} strokeWidth={1.2} />
        </motion.button>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <p style={{
          fontSize: '14px', color: '#6B7280', margin: 0,
          fontWeight: 500, letterSpacing: '-0.01em',
          textAlign: 'center', fontFamily: "'Manrope', sans-serif"
        }}>
          Você receberá acesso em breve
        </p>
      </div>
    </motion.div>
  );
}

// ─── Section title ────────────────────────────────────────────────────────────

function SectionTitle({ title, isFirst }) {
  return (
    <p style={{
      fontSize: '10px', color: '#6B7280', margin: isFirst ? '8px 0 12px 0' : '28px 0 12px 0',
      textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
      fontFamily: "'Outfit', sans-serif"
    }}>
      {title}
    </p>
  );
}

// ─── Nav row — clean card with animated chevron ───────────────────────────────

function NavRow({ icon: Icon, label, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      animate="rest"
      variants={{
        rest: { backgroundColor: '#000000' },
        hover: { backgroundColor: 'rgba(255,255,255,0.02)' },
        tap: { backgroundColor: 'rgba(255,255,255,0.04)', scale: 0.98 }
      }}
      transition={{ duration: 0.15 }}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 16px',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '4px', marginBottom: '8px',
        cursor: 'pointer', textAlign: 'left',
      }}
    >
      <div style={{ color: '#9CA3AF', display: 'flex' }}>
        {Icon && <Icon size={16} strokeWidth={1.5} />}
      </div>
      <span style={{
        flex: 1,
        fontSize: '13px', fontWeight: 500, color: '#ffffff',
        letterSpacing: '-0.01em', fontFamily: "'Manrope', sans-serif",
      }}>
        {label}
      </span>
      <motion.span
        variants={chevronVariants}
        transition={{ duration: 0.18 }}
        style={{ display: 'flex', alignItems: 'center', color: '#6B7280' }}
      >
        <ChevronRight size={14} strokeWidth={1.5} />
      </motion.span>
    </motion.button>
  );
}

const globalStyles = `
  .titovest-input {
    transition: border-color 0.2s ease, background 0.2s ease;
  }
  .titovest-input:focus {
    border-color: rgba(255,255,255,0.18) !important;
    background: rgba(255,255,255,0.02) !important;
  }
`;

// ─── Main component ───────────────────────────────────────────────────────────

export default function Sidebar({ isOpen, onClose, onLogout, user }) {
  const [activeScreen, setActiveScreen] = useState(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setActiveScreen(null);
    }
  }, [isOpen]);

  return (
    <>
      <style>{globalStyles}</style>
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
                background: 'rgba(0,0,0,0.90)',
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
              {/* ── Header ── */}
              <motion.div
                variants={bannerVariants}
                initial="hidden"
                animate="visible"
                style={{ padding: '24px 32px 32px' }}
              >
                {/* ── Close Button ── */}
                <motion.button
                  onClick={onClose}
                  aria-label="Fechar menu"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ opacity: 0.7 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: '#000000', border: '1px solid rgba(255,255,255,0.06)',
                    color: '#ffffff', cursor: 'pointer',
                    padding: 0, marginBottom: '32px'
                  }}
                >
                  <X size={14} strokeWidth={1.2} />
                </motion.button>

                {/* ── Avatar Section ── */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <div style={{
                      width: '72px', height: '72px', borderRadius: '50%',
                      background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '24px', fontWeight: 600, color: '#ffffff',
                      fontFamily: "'Manrope', sans-serif"
                    }}>
                      {user?.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        position: 'absolute', bottom: 0, right: '-4px',
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: '#000000', border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#9CA3AF', cursor: 'pointer', padding: 0
                      }}
                    >
                      <Edit2 size={10} strokeWidth={1.5} />
                    </motion.button>
                  </div>
                  
                  <h3 style={{
                    fontSize: '18px', fontWeight: 600, color: '#ffffff',
                    margin: '0 0 4px 0', letterSpacing: '-0.02em',
                    fontFamily: "'Manrope', sans-serif"
                  }}>
                    {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'}
                  </h3>
                  <p style={{
                    fontSize: '12px', color: '#6B7280', margin: 0,
                    letterSpacing: '0.01em', fontFamily: "'Manrope', sans-serif"
                  }}>
                    {user?.email || '—'}
                  </p>
                </div>

                {/* ── Mini Cards ── */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '32px', width: '100%' }}>
                  <div style={{
                    flex: 1, padding: '14px 14px',
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '10px'
                  }}>
                    <Zap size={14} color="#ffffff" strokeWidth={1.2} />
                    <div>
                      <p style={{ fontSize: '10px', color: '#6B7280', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Plano</p>
                      <p style={{ fontSize: '13px', color: '#ffffff', margin: 0, fontWeight: 500, letterSpacing: '-0.01em', fontFamily: "'Manrope', sans-serif" }}>Founder</p>
                    </div>
                  </div>
                  <div style={{
                    flex: 1, padding: '14px 14px',
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '10px'
                  }}>
                    <Landmark size={14} color="#ffffff" strokeWidth={1.2} />
                    <div>
                      <p style={{ fontSize: '10px', color: '#6B7280', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Conexões</p>
                      <p style={{ fontSize: '13px', color: '#ffffff', margin: 0, fontWeight: 500, letterSpacing: '-0.01em', fontFamily: "'Manrope', sans-serif" }}>Acesso em breve</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── Nav rows ── */}
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="visible"
                style={{ padding: '0 32px 32px' }}
              >
                <motion.div variants={itemVariants}>
                  <SectionTitle title="Geral" isFirst={true} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <NavRow icon={User} label="Perfil" onClick={() => setActiveScreen('perfil')} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <NavRow icon={Settings} label="Preferências" onClick={() => setActiveScreen('placeholder')} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <NavRow icon={CreditCard} label="Assinatura" onClick={() => setActiveScreen('placeholder')} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <NavRow icon={Key} label="API Keys" onClick={() => setActiveScreen('placeholder')} />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <SectionTitle title="Segurança" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <NavRow icon={Lock} label="Alterar senha" onClick={() => setActiveScreen('placeholder')} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <NavRow icon={Fingerprint} label="Biometria" onClick={() => setActiveScreen('placeholder')} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <NavRow icon={AlertCircle} label="Reportar um problema" onClick={() => setActiveScreen('placeholder')} />
                </motion.div>
              </motion.div>

              {/* ── Spacer ── */}
              <div style={{ flex: 1 }} />

              {/* ── Footer ── */}
              <div style={{ padding: '0 32px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '16px' }}>
                  <motion.button
                    onClick={() => setActiveScreen('placeholder')}
                    whileHover={{ color: '#d1d5db' }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: 'none', border: 'none', padding: '8px', cursor: 'pointer',
                      color: '#6B7280', fontSize: '11px', fontWeight: 500, letterSpacing: '0.02em',
                      fontFamily: "'Manrope', sans-serif",
                    }}
                  >
                    Termos de uso
                  </motion.button>
                  <motion.button
                    onClick={() => setActiveScreen('placeholder')}
                    whileHover={{ color: '#d1d5db' }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: 'none', border: 'none', padding: '8px', cursor: 'pointer',
                      color: '#6B7280', fontSize: '11px', fontWeight: 500, letterSpacing: '0.02em',
                      fontFamily: "'Manrope', sans-serif",
                    }}
                  >
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
        {activeScreen === 'perfil' && (
          <AccountModal
            key="account-modal"
            onBack={() => setActiveScreen(null)}
            user={user}
            onLogout={onLogout}
          />
        )}
        {activeScreen && activeScreen !== 'perfil' && (
          <PlaceholderScreen
            key="placeholder-screen"
            onBack={() => setActiveScreen(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
