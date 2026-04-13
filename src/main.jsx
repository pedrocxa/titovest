import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// ======== REGISTRO DO SERVICE WORKER (PWA) ========
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registrado com sucesso: ', registration.scope);
      })
      .catch(error => {
        console.log('Falha ao registrar o Service Worker: ', error);
      });
  });
}
// ==================================================