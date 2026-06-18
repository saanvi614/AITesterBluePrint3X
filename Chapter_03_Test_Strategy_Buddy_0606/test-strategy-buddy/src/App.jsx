import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Settings from './pages/Settings'
import Epic from './pages/Epic'
import ChildItem from './pages/ChildItem'
import HLTP from './pages/HLTP'
import TestStrategy from './pages/TestStrategy'
import TestCase from './pages/TestCase'
import TestExecution from './pages/TestExecution'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/epic" element={<Epic />} />
          <Route path="/child-item" element={<ChildItem />} />
          <Route path="/hltp" element={<HLTP />} />
          <Route path="/test-strategy" element={<TestStrategy />} />
          <Route path="/test-case" element={<TestCase />} />
          <Route path="/test-execution" element={<TestExecution />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
