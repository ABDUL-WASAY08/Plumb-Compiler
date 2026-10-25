import { Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header.jsx'
import SidebarNavigation from './components/SidebarNavigation.jsx'
import ASTScreen from './screens/ASTScreen.jsx'
import AboutScreen from './screens/AboutScreen.jsx'
import CompilerScreen from './screens/CompilerScreen.jsx'
import MetricsScreen from './screens/MetricsScreen.jsx'
import SettingsScreen from './screens/SettingsScreen.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
      <Header />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <SidebarNavigation />
        <main className="min-w-0">
          <Routes>
            <Route path="/" element={<CompilerScreen />} />
            <Route path="/ast" element={<ASTScreen />} />
            <Route path="/metrics" element={<MetricsScreen />} />
            <Route path="/about" element={<AboutScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
