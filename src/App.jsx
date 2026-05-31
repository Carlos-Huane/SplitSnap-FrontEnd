import { Routes, Route, useLocation } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { SidebarProvider, useSidebar } from './context/SidebarContext'
import Sidebar from './components/shared/Sidebar'
import RequireAuth from './components/shared/RequireAuth'
import Splash from './pages/Splash'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
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

const noSidebarRoutes = ['/', '/login', '/register', '/forgot-password']

function SidebarOverlay() {
  const { isOpen, closeSidebar } = useSidebar()
  if (!isOpen) return null
  return <div className="app-overlay" onClick={closeSidebar} />
}

function MenuToggle() {
  const { isOpen, toggleSidebar } = useSidebar()
  if (isOpen) return null
  return (
    <button
      type="button"
      className="app-menu-toggle"
      onClick={toggleSidebar}
      aria-label="Abrir menú"
    >
      ☰
    </button>
  )
}

const protect = (el) => <RequireAuth>{el}</RequireAuth>

function AppRoutes() {
  const location = useLocation()
  const showSidebar = !noSidebarRoutes.includes(location.pathname)

  return (
    <div className="app-layout">
      {showSidebar && <Sidebar />}
      {showSidebar && <MenuToggle />}
      <SidebarOverlay />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={protect(<Dashboard />)} />
          <Route path="/groups" element={protect(<GroupList />)} />
          <Route path="/groups/new" element={protect(<CreateGroup />)} />
          <Route path="/groups/:id" element={protect(<GroupDetail />)} />
          <Route path="/groups/:id/invite" element={protect(<InviteMembers />)} />
          <Route path="/groups/:id/add-expense" element={protect(<AddExpense />)} />
          <Route path="/groups/:id/scan" element={protect(<ScanReceipt />)} />
          <Route path="/groups/:id/scan/review" element={protect(<ReviewItems />)} />
          <Route path="/groups/:id/debts" element={protect(<DebtSummary />)} />
          <Route path="/historial" element={protect(<Historial />)} />
          <Route path="/profile" element={protect(<Profile />)} />
          <Route path="/empty" element={protect(<EmptyState />)} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <SidebarProvider>
        <AppRoutes />
      </SidebarProvider>
    </AppProvider>
  )
}

export default App
