import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTransactions } from '../../services/transactions.service'
import { getMyGroups } from '../../services/groups.service'
import { extractErrorMessage } from '../../services/api'
import './Historial.css'

// El backend devuelve type en MAYUSCULAS: "EXPENSE" o "PAYMENT".
// El query param para filtrar es minuscula: "expense" o "payment".
const TYPE_META = {
  EXPENSE: { label: 'Gasto agregado', emoji: '💸' },
  PAYMENT: { label: 'Pago realizado', emoji: '✅' },
}

function Historial() {
  const navigate = useNavigate()

  const [transactions, setTransactions] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtros server-side (refetch al cambiar)
  const [filterType, setFilterType] = useState('all')
  const [filterGroup, setFilterGroup] = useState('all')

  // Filtros client-side
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [searchText, setSearchText] = useState('')

  // Cargar grupos una sola vez para el dropdown
  useEffect(() => {
    let cancelled = false
    getMyGroups()
      .then((data) => { if (!cancelled) setGroups(data || []) })
      .catch(() => { /* dropdown vacio si falla, no es bloqueante */ })
    return () => { cancelled = true }
  }, [])

  // Recargar transacciones al cambiar los filtros server-side
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const params = {}
    if (filterGroup !== 'all') params.groupId = filterGroup
    if (filterType !== 'all') params.type = filterType // 'expense' | 'payment'

    getTransactions(params)
      .then((data) => {
        if (cancelled) return
        setTransactions(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (cancelled) return
        setError(extractErrorMessage(err, 'No pudimos cargar el historial.'))
        setTransactions([])
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [filterType, filterGroup])

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const dateOnly = (t.date || '').slice(0, 10) // 'YYYY-MM-DD'
      if (dateFrom && dateOnly && dateOnly < dateFrom) return false
      if (dateTo && dateOnly && dateOnly > dateTo) return false
      if (searchText) {
        const q = searchText.toLowerCase()
        const desc = (t.description || '').toLowerCase()
        const grp = (t.groupName || '').toLowerCase()
        if (!desc.includes(q) && !grp.includes(q)) return false
      }
      return true
    })
  }, [transactions, dateFrom, dateTo, searchText])

  const stats = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'EXPENSE')
    const payments = filteredTransactions.filter(t => t.type === 'PAYMENT')
    return {
      totalSpent: expenses.reduce((s, t) => s + (Number(t.amount) || 0), 0),
      totalPaid: payments.reduce((s, t) => s + (Number(t.amount) || 0), 0),
      expenseCount: expenses.length,
      paymentCount: payments.length,
    }
  }, [filteredTransactions])

  const hasData = transactions.length > 0

  const formatDate = (iso) => {
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleDateString('es-PE', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    } catch {
      return iso
    }
  }

  const resetFilters = () => {
    setFilterType('all')
    setFilterGroup('all')
    setDateFrom('')
    setDateTo('')
    setSearchText('')
  }

  return (
    <div className="page-historial">
      <div className="historial-header">
        <div>
          <h1>Historial de Transacciones</h1>
          <p>Revisa todos tus gastos y pagos en un solo lugar</p>
        </div>
      </div>

      {error && (
        <p style={{ color: '#ff4d4d', padding: '0 1rem' }}>⚠️ {error}</p>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando historial...</p>
      ) : !hasData ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Aún no hay transacciones</h3>
          <p>Solo aparecen los gastos que tú pagaste y las deudas que ya saldaste.</p>
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
              <div className="stat-icon" style={{ background: '#FEE2E2' }}><span>💸</span></div>
              <div className="stat-content">
                <p className="stat-label">Total gastado</p>
                <h3 className="stat-value">S/ {stats.totalSpent.toFixed(2)}</h3>
                <p className="stat-subtext">Gastos que pagaste</p>
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
                <p className="stat-subtext">Deudas saldadas</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E0E7FF' }}><span>💰</span></div>
              <div className="stat-content">
                <p className="stat-label">Pagos realizados</p>
                <h3 className="stat-value">{stats.paymentCount}</h3>
                <p className="stat-subtext">Cantidad de pagos</p>
              </div>
            </div>
          </div>

          <div className="historial-filters">
            <h3 className="filters-title">Filtros</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label>Buscar</label>
                <input
                  type="text"
                  placeholder="Descripción o grupo..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>Tipo de Transacción</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                  <option value="all">Todos</option>
                  <option value="expense">Solo Gastos</option>
                  <option value="payment">Solo Pagos</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Grupo</label>
                <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} className="filter-select">
                  <option value="all">Todos los grupos</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.emoji ? `${g.emoji} ` : ''}{g.name}</option>
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
              <button className="btn-reset-filters" onClick={resetFilters}>
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
                      <th>Monto</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((t, idx) => {
                      const meta = TYPE_META[t.type] || { label: t.type, emoji: '•' }
                      const isExpense = t.type === 'EXPENSE'
                      return (
                        <tr
                          key={t.id || `tx-${idx}`}
                          className={`transaction-row type-${(t.type || '').toLowerCase()}`}
                        >
                          <td>
                            <div className="transaction-type">
                              <span className="type-emoji">{meta.emoji}</span>
                              <span className="type-label">{meta.label}</span>
                            </div>
                          </td>
                          <td>
                            <span className="transaction-description">{t.description || '—'}</span>
                          </td>
                          <td>
                            <span className="transaction-group">{t.groupName || 'Sin grupo'}</span>
                          </td>
                          <td>
                            <span className={`transaction-amount amount-${isExpense ? 'out' : 'in'}`}>
                              {isExpense ? '-' : '+'}S/ {(Number(t.amount) || 0).toFixed(2)}
                            </span>
                          </td>
                          <td>
                            <span className="transaction-date">{formatDate(t.date)}</span>
                          </td>
                        </tr>
                      )
                    })}
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
