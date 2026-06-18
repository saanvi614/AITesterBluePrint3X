import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [epicId, setEpicId] = useState(() => localStorage.getItem('tsb_epicId') || null)
  const [epicKey, setEpicKey] = useState(() => localStorage.getItem('tsb_epicKey') || null)
  const [epicSummary, setEpicSummary] = useState(() => localStorage.getItem('tsb_epicSummary') || null)
  const [theme, setTheme] = useState(() => localStorage.getItem('tsb_theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('tsb_theme', theme)
  }, [theme])

  const saveEpic = ({ id, key, summary }) => {
    setEpicId(id)
    setEpicKey(key)
    setEpicSummary(summary)
    localStorage.setItem('tsb_epicId', id)
    localStorage.setItem('tsb_epicKey', key)
    localStorage.setItem('tsb_epicSummary', summary)
  }

  const clearEpic = () => {
    setEpicId(null)
    setEpicKey(null)
    setEpicSummary(null)
    localStorage.removeItem('tsb_epicId')
    localStorage.removeItem('tsb_epicKey')
    localStorage.removeItem('tsb_epicSummary')
  }

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <AppContext.Provider value={{ epicId, epicKey, epicSummary, saveEpic, clearEpic, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
