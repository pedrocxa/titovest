import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, Phone, FileText, Headphones, ChevronRight, LogOut } from 'lucide-react';
import panteraImg from './assets/pantera.png';

const NAV_ITEMS = [
  { icon: LogIn,      label: 'Acessar Conta' },
  { icon: Phone,      label: 'Número de Telefone' },
  { icon: FileText,   label: 'Termos de Uso' },
  { icon: Headphones, label: 'Suporte' },
];

// --- Variants ---

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
  visible: { transition: { staggerChildren: 0.065, delayChildren: 0.24 } },
};

const itemVariants = {
  hidden:  { opacity: 0, x: 22 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] } },
};

// --- Component ---

export default function Sidebar({ isOpen, onClose, onLogout }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
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
              display: 'flex',
              flexDirection: 'column',
              fontFamily: "'Manrope', sans-serif",
              overflowY: 'auto',
              overscrollBehavior: 'contain',
            }}
          >
            {/* ── Close button ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 20px 6px' }}>
              <motion.button
                onClick={onClose}
                aria-label="Fechar menu"
                whileTap={{ scale: 0.88 }}
                whileHover={{ opacity: 0.7 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '44px', height: '44px',
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  flexShrink: 0,
                  padding: 0,
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
              style={{ padding: '10px 20px 32px' }}
            >
              <img
                src={panteraImg}
                alt="TitoVest"
                style={{
                  width: '100%',
                  borderRadius: '24px',
                  display: 'block',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            </motion.div>

            {/* ── Section label ── */}
            <div style={{ padding: '0 24px 10px' }}>
              <p style={{
                fontSize: '10px', fontWeight: 600,
                letterSpacing: '0.10em', color: '#4B5563',
                textTransform: 'uppercase',
              }}>
                Menu
              </p>
            </div>

            {/* ── Nav items ── */}
            <motion.nav
              variants={listVariants}
              initial="hidden"
              animate="visible"
              style={{ padding: '0 12px', flex: 1 }}
            >
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
                {NAV_ITEMS.map(({ icon: Icon, label }, i) => (
                  <motion.li key={i} variants={itemVariants}>
                    <motion.button
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                      whileTap={{ scale: 0.975, backgroundColor: 'rgba(255,255,255,0.07)' }}
                      transition={{ duration: 0.15 }}
                      style={{
                        width: '100%',
                        display: 'flex', alignItems: 'center', gap: '16px',
                        padding: '15px 14px',
                        borderRadius: '12px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {/* Plain glyph icon — no card, no background */}
                      <Icon
                        size={19}
                        strokeWidth={1.65}
                        color="#9CA3AF"
                        style={{ flexShrink: 0 }}
                      />

                      {/* Label */}
                      <span style={{
                        flex: 1,
                        fontSize: '15px', fontWeight: 500,
                        color: '#ffffff',
                        fontFamily: "'Manrope', sans-serif",
                        letterSpacing: '-0.01em',
                      }}>
                        {label}
                      </span>

                      {/* Chevron */}
                      <ChevronRight
                        size={16}
                        strokeWidth={1.5}
                        color="#9CA3AF"
                        style={{ flexShrink: 0, opacity: 0.6 }}
                      />
                    </motion.button>

                    {/* Thin separator (except after last item) */}
                    {i < NAV_ITEMS.length - 1 && (
                      <div style={{
                        height: '1px',
                        background: 'rgba(255,255,255,0.04)',
                        margin: '0 14px',
                      }} />
                    )}
                  </motion.li>
                ))}
              </ul>
            </motion.nav>

            {/* ── Logout ── */}
            {onLogout && (
              <div style={{ padding: '8px 12px 0' }}>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 2px 8px' }} />
                <motion.button
                  onClick={() => { onClose(); onLogout(); }}
                  whileHover={{ backgroundColor: 'rgba(239,68,68,0.08)' }}
                  whileTap={{ scale: 0.975, backgroundColor: 'rgba(239,68,68,0.13)' }}
                  transition={{ duration: 0.15 }}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '15px 14px',
                    borderRadius: '12px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <LogOut size={19} strokeWidth={1.65} color="#ef4444" style={{ flexShrink: 0 }} />
                  <span style={{
                    flex: 1,
                    fontSize: '15px', fontWeight: 500,
                    color: '#ef4444',
                    fontFamily: "'Manrope', sans-serif",
                    letterSpacing: '-0.01em',
                  }}>
                    Sair da conta
                  </span>
                </motion.button>
              </div>
            )}

            {/* ── Footer ── */}
            <div style={{ padding: '24px 24px 48px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#4B5563', letterSpacing: '0.02em' }}>
                TitoVest © 2026
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
