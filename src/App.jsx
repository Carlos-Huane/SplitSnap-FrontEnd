import { Routes, Route } from 'react-router-dom'
import Splash from './pages/Splash'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import GroupDetail from './pages/GroupDetail'
import CreateGroup from './pages/CreateGroup'
import InviteMembers from './pages/InviteMembers'
import AddExpense from './pages/AddExpense'
import ScanReceipt from './pages/ScanReceipt'
import ReviewItems from './pages/ReviewItems'
import DebtSummary from './pages/DebtSummary'
import Profile from './pages/Profile'
import EmptyState from './pages/EmptyState'
import Historial from './pages/Historial'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/groups/new" element={<CreateGroup />} />
      <Route path="/groups/:id" element={<GroupDetail />} />
      <Route path="/groups/:id/invite" element={<InviteMembers />} />
      <Route path="/groups/:id/add-expense" element={<AddExpense />} />
      <Route path="/groups/:id/scan" element={<ScanReceipt />} />
      <Route path="/groups/:id/scan/review" element={<ReviewItems />} />
      <Route path="/groups/:id/debts" element={<DebtSummary />} />
      <Route path="/historial" element={<Historial />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/empty" element={<EmptyState />} />
    </Routes>
  )
}

export default App
