import { useState } from 'react'
import { supabase } from '../lib/supabase'

const inputStyle = {
  padding: '14px 16px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '14px',
  fontFamily: "'Manrope', sans-serif",
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
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
        justifyContent: 'center',
        fontFamily: "'Manrope', sans-serif",
        padding: '32px 24px',
        boxSizing: 'border-box',
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: '52px', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 500,
            fontSize: 'clamp(2rem, 8vw, 3rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            margin: 0,
          }}
        >
          <span style={{ color: '#fff' }}>Tito</span>
          <span style={{ color: '#6d4aad' }}>Vest</span>
        </h1>
        <p
          style={{
            color: '#555',
            fontSize: '13px',
            margin: '10px 0 0',
            letterSpacing: '0.04em',
          }}
        >
          {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta gratuita'}
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '28px',
          width: '100%',
          maxWidth: '360px',
          boxSizing: 'border-box',
        }}
      >
        {['login', 'signup'].map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            style={{
              flex: 1,
              padding: '9px',
              background: mode === m ? '#6d4aad' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: mode === m ? '#fff' : '#555',
              fontSize: '12px',
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {m === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>
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
          gap: '12px',
          boxSizing: 'border-box',
        }}
      >
        {mode === 'signup' && (
          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            style={inputStyle}
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
        />

        <input
          type="password"
          placeholder="Senha (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          style={inputStyle}
        />

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

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '8px',
            padding: '15px',
            background: loading ? '#4a3278' : '#6d4aad',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? 'Aguarde...'
            : mode === 'login'
            ? 'Entrar'
            : 'Criar conta'}
        </button>
      </form>
    </div>
  )
}
