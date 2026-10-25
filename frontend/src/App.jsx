import { Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header.jsx'
import SidebarNavigation from './components/SidebarNavigation.jsx'
import ASTScreen from './screens/ASTScreen.jsx'
import CompilerScreen from './screens/CompilerScreen.jsx'
import MetricsScreen from './screens/MetricsScreen.jsx'
import SettingsScreen from './screens/SettingsScreen.jsx'
import AboutScreen from './screens/About.jsx'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 lg:flex-row">
      <SidebarNavigation />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
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
