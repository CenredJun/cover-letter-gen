import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { seedDefaultProfile } from './store/appStore'

// Seed the default profile on first load (no-op if profiles already exist).
seedDefaultProfile()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
