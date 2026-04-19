import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSidebar } from '../context/SidebarContext'
import { transactions, transactionTypes } from '../data/historial'
import { users, currentUser } from '../data/global'
import { useApp } from '../context/AppContext'
import './Historial.css'

function Historial() {
  const navigate = useNavigate()
  const { toggleSidebar } = useSidebar()
  const { groups } = useApp()
  
  const [filterType, setFilterType] = useState('all')
  const [filterGroup, setFilterGroup] = useState('all')
  const [filterUser, setFilterUser] = useState('current')
  const [dateFrom, setDateFrom] = useState('2026-03-01')
  const [dateTo, setDateTo] = useState('2026-03-31')
  const [searchText, setSearchText] = useState('')

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false
      if (filterGroup !== 'all' && t.groupId !== filterGroup) return false
      if (filterUser === 'current' && t.userId !== currentUser.id) return false
      if (filterUser !== 'current' && filterUser !== 'all' && t.userId !== filterUser) return false
      if (t.date < dateFrom || t.date > dateTo) return false
      if (searchText && !t.description.toLowerCase().includes(searchText.toLowerCase())) return false
      return true
    })
  }, [filterType, filterGroup, filterUser, dateFrom, dateTo, searchText])

  const stats = useMemo(() => {
    const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
    const expenseCount = filteredTransactions.filter(t => t.type === 'expense_created').length
    const paymentCount = filteredTransactions.filter(t => t.type === 'debt_paid').length
    const avgTransaction = filteredTransactions.length ? (totalAmount / filteredTransactions.length).toFixed(2) : 0

    return { totalAmount, expenseCount, paymentCount, avgTransaction }
  }, [filteredTransactions])

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId)
    return user?.name || 'Usuario desconocido'
  }

  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id === groupId)
    return group?.name || 'Grupo desconocido'
  }


  return (
    <div className="page-historial">
      <div className="historial-header">
        <div>
          <h1>Historial de Transacciones</h1>
          <p>Revisa todos tus movimientos, gastos y pagos en un solo lugar</p>
        </div>
        <button className="historial-menu-btn" onClick={toggleSidebar} title="Abrir menú">
          ☰
        </button>
      </div>

      <div className="historial-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEE2E2' }}>
            <span>$</span>
          </div>
          <div className="stat-content">
            <p className="stat-label">Monto Total</p>
            <h3 className="stat-value">S/ {stats.totalAmount.toFixed(2)}</h3>
            <p className="stat-subtext">{filteredTransactions.length} transacciones</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF08A' }}>
            <span>#</span>
          </div>
          <div className="stat-content">
            <p className="stat-label">Gastos Registrados</p>
            <h3 className="stat-value">{stats.expenseCount}</h3>
            <p className="stat-subtext">En el período seleccionado</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#DCFCE7' }}>
            <span>✓</span>
          </div>
          <div className="stat-content">
            <p className="stat-label">Pagos Realizados</p>
            <h3 className="stat-value">{stats.paymentCount}</h3>
            <p className="stat-subtext">Deudas saldadas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E0E7FF' }}>
            <span>≈</span>
          </div>
          <div className="stat-content">
            <p className="stat-label">Promedio por Gasto</p>
            <h3 className="stat-value">S/ {stats.avgTransaction}</h3>
            <p className="stat-subtext">Monto medio</p>
          </div>
        </div>
      </div>

      <div className="historial-filters">
        <h3 className="filters-title">Filtros Avanzados</h3>
        
        <div className="filters-grid">
          <div className="filter-group">
            <label>Buscar descripción</label>
            <input
              type="text"
              placeholder="Ej: Hospedaje, pizza..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Tipo de Transacción</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
              <option value="all">Todos</option>
              <option value="expense_created">Solo Gastos</option>
              <option value="debt_paid">Solo Pagos</option>
              <option value="expense_edited">Solo Ediciones</option>
              <option value="group_joined">Solo Adhesiones</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Grupo</label>
            <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} className="filter-select">
              <option value="all">Todos los grupos</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Usuario</label>
            <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className="filter-select">
              <option value="current">Solo mis transacciones</option>
              <option value="all">Todos los usuarios</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="filter-input"
            />
          </div>
        </div>

        <div className="filters-actions">
          <button
            className="btn-reset-filters"
            onClick={() => {
              setFilterType('all')
              setFilterGroup('all')
              setFilterUser('current')
              setDateFrom('2026-03-01')
              setDateTo('2026-03-31')
              setSearchText('')
            }}
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      <div className="historial-content">
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">—</div>
            <h3>No hay transacciones</h3>
            <p>Ajusta los filtros o crea una nueva transacción para comenzar</p>
          </div>
        ) : (
          <div className="transactions-table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Grupo</th>
                  <th>Usuario</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(t => (
                  <tr key={t.id} className={`transaction-row type-${t.type}`}>
                    <td>
                      <div className="transaction-type">
                        <span className="type-emoji">{transactionTypes[t.type]?.emoji}</span>
                        <span className="type-label">{transactionTypes[t.type]?.label}</span>
                      </div>
                    </td>
                    <td>
                      <span className="transaction-description">{t.description}</span>
                    </td>
                    <td>
                      <span className="transaction-group">{getGroupName(t.groupId)}</span>
                    </td>
                    <td>
                      <div className="transaction-user">
                        <img
                          src={users.find(u => u.id === t.userId)?.avatar}
                          alt={getUserName(t.userId)}
                          className="user-avatar-small"
                        />
                        <span>{getUserName(t.userId)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`transaction-amount amount-${t.type === 'debt_paid' || t.type === 'expense_created' ? 'out' : 'in'}`}>
                        {t.type === 'debt_paid' || t.type === 'expense_created' ? '-' : '+'}S/ {t.amount.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className="transaction-date">{new Date(t.date).toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Historial
