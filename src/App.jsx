import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/shared/Sidebar'
import Splash from './pages/Splash'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import GroupList from './pages/GroupList'
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
import './App.css'

const noSidebarRoutes = ['/', '/login', '/register']

function App() {
  const location = useLocation()
  const showSidebar = !noSidebarRoutes.includes(location.pathname)

  return (
    <div className="app-layout">
      {showSidebar && <Sidebar />}
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/groups" element={<GroupList />} />
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
      </main>
    </div>
  )
}

export default App
