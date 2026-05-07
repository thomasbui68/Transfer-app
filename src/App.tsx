import { Routes, Route } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import Properties from '@/pages/Properties'
import Transactions from '@/pages/Transactions'
import TransactionDetail from '@/pages/TransactionDetail'
import AIAssistant from '@/pages/AIAssistant'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/:id" element={<TransactionDetail />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      } />
    </Routes>
  )
}
