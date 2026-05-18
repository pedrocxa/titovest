import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { LiquidMetalButton } from './LiquidMetalButton'
import { motion, AnimatePresence } from 'framer-motion'

const inputStyle = {
  padding: '16px 18px',
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '14px',
  fontFamily: "'Manrope', sans-serif",
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, background 0.2s',
}

const ERROR_MAP = {
  'Invalid login credentials':        'Email ou senha incorretos.',
  'Email not confirmed':               'Confirme seu email antes de entrar.',
  'User already registered':           'Este email já está cadastrado.',
  'Password should be at least':       'A senha deve ter no mínimo 6 caracteres.',
  'Unable to validate email address':  'Email inválido.',
  'signup_disabled':                   'Cadastro temporariamente desativado.',
}

function translateError(message) {
  for (const [key, translated] of Object.entries(ERROR_MAP)) {
    if (message.includes(key)) return translated
  }
  return message
}

export default function AuthScreen() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const resetForm = () => {
    setError(null)
    setSuccess(null)
  }

  const switchMode = (next) => {
    setMode(next)
    resetForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    resetForm()
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name.trim() || email.split('@')[0] },
        },
      })
      if (error) {
        setError(translateError(error.message))
      } else {
        setSuccess('Conta criada! Verifique seu email para confirmar o cadastro.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(translateError(error.message))
      // Sucesso: onAuthStateChange no App.jsx detecta a sessão e redireciona
    }

    setLoading(false)
  }

  return (
    <div
      style={{
        background: '#000',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontFamily: "'Manrope', sans-serif",
        padding: '12vh 24px 32px',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        .auth-input:focus {
          border-color: rgba(255,255,255,0.2) !important;
          background: rgba(255,255,255,0.02) !important;
        }
      `}</style>
      {/* Logo */}
      <div style={{ marginBottom: '48px', textAlign: 'center', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <img src="/pantera negra auth.png" alt="TitoVest" style={{ height: '320px', width: 'auto', objectFit: 'contain' }} />
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          width: '100%',
          maxWidth: '360px',
          boxSizing: 'border-box',
          height: '48px',
        }}
      >
        {['login', 'signup'].map((m) => (
          <div key={m} style={{ flex: 1, position: 'relative', height: '100%' }}>
            <LiquidMetalButton
              label={m === 'login' ? 'Login' : 'Cadastro'}
              onClick={() => switchMode(m)}
              isActive={mode === m}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        ))}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '360px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ position: 'relative', width: '100%' }}>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 10 : -10 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}
            >
              {mode === 'signup' && (
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  style={inputStyle}
                  className="auth-input"
                />
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={inputStyle}
                className="auth-input"
              />

              <input
                type="password"
                placeholder={mode === 'login' ? "Senha" : "Crie sua senha"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                style={inputStyle}
                className="auth-input"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {error && (
          <p
            style={{
              color: '#ef4444',
              fontSize: '13px',
              margin: '2px 0 0',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            {error}
          </p>
        )}

        {success && (
          <p
            style={{
              color: '#34d399',
              fontSize: '13px',
              margin: '2px 0 0',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            {success}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
          <div style={{ position: 'relative', height: '52px', minWidth: '180px', display: 'inline-flex' }}>
            <LiquidMetalButton
              label={loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
              type="submit"
              disabled={loading}
              isActive={true}
              onClick={handleSubmit}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </form>
    </div>
  )
}
