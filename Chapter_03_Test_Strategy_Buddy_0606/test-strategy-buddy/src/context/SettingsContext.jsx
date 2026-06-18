import { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext(null)

const DEFAULTS = {
  jiraBaseUrl: import.meta.env.VITE_JIRA_BASE_URL || '',
  jiraEmail: import.meta.env.VITE_JIRA_EMAIL || '',
  jiraApiToken: import.meta.env.VITE_JIRA_API_TOKEN || '',
  groqApiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  groqModel: import.meta.env.VITE_GROQ_MODEL || 'openai/gpt-oss-120b',
  sutUrl: import.meta.env.VITE_SUT_URL || 'https://courses.thetestingacademy.com/',
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('tsb_settings')
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  const saveSettings = (updated) => {
    const next = { ...settings, ...updated }
    setSettings(next)
    localStorage.setItem('tsb_settings', JSON.stringify(next))
  }

  return (
    <SettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
