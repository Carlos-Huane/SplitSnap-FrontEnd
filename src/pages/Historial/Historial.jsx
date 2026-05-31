import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { transactionTypes } from '../../data/historial'
import { useApp } from '../../context/AppContext'
import './Historial.css'

function Historial() {
  const navigate = useNavigate()
  const { groups, expenses, debts, allUsers, currentUser } = useApp()
  const users = allUsers

  const [filterType, setFilterType] = useState('all')
  const [filterGroup, setFilterGroup] = useState('all')
  const [filterUser, setFilterUser] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [searchText, setSearchText] = useState('')

  const allTransactions = useMemo(() => {
    const fromExpenses = expenses.map(e => {
      const participantIds = [e.paidBy, ...(e.splitBetween || []).map(s => s.userId)]
      return {
        id: e.id,
        type: 'expense_created',
        userId: e.paidBy,
        participantIds: [...new Set(participantIds)],
        groupId: e.groupId,
        amount: e.amount,
        date: e.date,
        description: e.description,
      }
    })
    const fromPayments = debts
      .filter(d => d.status === 'paid')
      .map(d => ({
        id: d.id,
        type: 'debt_paid',
        userId: d.fromUserId,
        participantIds: [d.fromUserId, d.toUserId],
        groupId: d.groupId,
        amount: d.amount,
        date: d.paidAt || d.createdAt,
        description: `Pago a ${users.find(u => u.id === d.toUserId)?.name?.split(' ')[0] || 'usuario'}`,
      }))
    return [...fromExpenses, ...fromPayments].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [expenses, debts, users])

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false
      if (filterGroup !== 'all' && t.groupId !== filterGroup) return false
      if (filterUser === 'current') {
        const involvesMe = t.participantIds?.includes(currentUser.id) ||
          groups.find(g => g.id === t.groupId)?.memberIds.includes(currentUser.id)
        if (!involvesMe) return false
      } else if (filterUser !== 'all' && t.userId !== filterUser) {
        return false
      }
      if (dateFrom && t.date < dateFrom) return false
      if (dateTo && t.date > dateTo) return false
      if (searchText && !t.description.toLowerCase().includes(searchText.toLowerCase())) return false
      return true
    })
  }, [allTransactions, filterType, filterGroup, filterUser, dateFrom, dateTo, searchText, currentUser.id, groups])

  const stats = useMemo(() => {
    const expensesList = filteredTransactions.filter(t => t.type === 'expense_created')
    const paymentsList = filteredTransactions.filter(t => t.type === 'debt_paid')
    const totalSpent = expensesList.reduce((sum, t) => sum + t.amount, 0)
    const totalPaid = paymentsList.reduce((sum, t) => sum + t.amount, 0)
    return {
      totalSpent,
      totalPaid,
      expenseCount: expensesList.length,
      paymentCount: paymentsList.length,
    }
  }, [filteredTransactions])

  const getUserName = (userId) =>
    users.find(u => u.id === userId)?.name || 'Usuario desconocido'

  const getGroupName = (groupId) =>
    groups.find(g => g.id === groupId)?.name || 'Grupo desconocido'

  const hasData = allTransactions.length > 0

  return (
    <div className="page-historial">
      <div className="historial-header">
        <div>
          <h1>Historial de Transacciones</h1>
          <p>Revisa todos tus movimientos, gastos y pagos en un solo lugar</p>
        </div>
      </div>

      {!hasData ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Aún no hay transacciones</h3>
          <p>Crea un grupo y registra tu primer gasto o pago para verlo aquí.</p>
          <button
            className="btn-reset-filters"
            style={{ marginTop: 16 }}
            onClick={() => navigate('/groups')}
          >
            Ir a Mis grupos
          </button>
        </div>
      ) : (
        <>
          <div className="historial-stats">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#DCFCE7' }}><span>💸</span></div>
              <div className="stat-content">
                <p className="stat-label">Total gastado</p>
                <h3 className="stat-value">S/ {stats.totalSpent.toFixed(2)}</h3>
                <p className="stat-subtext">Suma de gastos registrados</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#FEF08A' }}><span>📝</span></div>
              <div className="stat-content">
                <p className="stat-label">Gastos registrados</p>
                <h3 className="stat-value">{stats.expenseCount}</h3>
                <p className="stat-subtext">Cantidad de gastos creados</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#DCFCE7' }}><span>✅</span></div>
              <div className="stat-content">
                <p className="stat-label">Total pagado</p>
                <h3 className="stat-value">S/ {stats.totalPaid.toFixed(2)}</h3>
                <p className="stat-subtext">Suma de deudas saldadas</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E0E7FF' }}><span>💰</span></div>
              <div className="stat-content">
                <p className="stat-label">Pagos realizados</p>
                <h3 className="stat-value">{stats.paymentCount}</h3>
                <p className="stat-subtext">Cantidad de pagos efectuados</p>
              </div>
            </div>
          </div>

          <div className="historial-filters">
            <h3 className="filters-title">Filtros</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label>Buscar descripción</label>
                <input
                  type="text"
                  placeholder="Ej: Pizza, alquiler..."
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
                  <option value="all">Todos los usuarios</option>
                  <option value="current">Solo mis transacciones</option>
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
                  setFilterUser('all')
                  setDateFrom('')
                  setDateTo('')
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
                <div className="empty-icon">🔎</div>
                <h3>No hay resultados</h3>
                <p>Ajusta los filtros para ver más movimientos.</p>
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
                      <tr
                        key={t.id}
                        className={`transaction-row type-${t.type}`}
                        onClick={() => navigate(`/groups/${t.groupId}`)}
                        style={{ cursor: 'pointer' }}
                      >
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
                          <span className={`transaction-amount amount-${t.type === 'expense_created' ? 'out' : 'in'}`}>
                            {t.type === 'expense_created' ? '-' : '+'}S/ {t.amount.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span className="transaction-date">
                            {new Date(t.date + (t.date.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Historial
