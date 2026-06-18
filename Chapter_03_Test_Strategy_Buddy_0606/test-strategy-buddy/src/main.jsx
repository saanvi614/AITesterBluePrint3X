import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { SettingsProvider } from './context/SettingsContext'
import { AppProvider } from './context/AppContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
)
