# 🔧 Guía de Integración Frontend — SplitSnap

> Guía práctica para conectar tu pantalla del frontend al backend desplegado en Railway. Lee solo la sección de **tu épica** + las secciones comunes 0, 1, 2 y 3.

## Índice

- [0. Antes de empezar (prerequisitos)](#0-antes-de-empezar-prerequisitos)
- [1. Setup local en 5 minutos](#1-setup-local-en-5-minutos)
- [2. Tu primer login real (validar conexión)](#2-tu-primer-login-real-validar-conexión)
- [3. Patrón estándar de integración](#3-patrón-estándar-de-integración)
- [4. Guía F1 — Auth y Perfil (Marcela)](#4-guía-f1--auth-y-perfil-marcela)
- [5. Guía F2 — Grupos (Obed)](#5-guía-f2--grupos-obed)
- [6. Guía F3 — Detalle de Grupo y Gastos (Yorma)](#6-guía-f3--detalle-de-grupo-y-gastos-yorma)
- [7. Guía F5 — Deudas y Pagos (Dafne)](#7-guía-f5--deudas-y-pagos-dafne)
- [8. Manejo de errores HTTP](#8-manejo-de-errores-http)
- [9. Gaps conocidos del backend](#9-gaps-conocidos-del-backend)
- [10. Convenciones de branches y commits](#10-convenciones-de-branches-y-commits)
- [11. Debugging](#11-debugging)
- [12. Cómo pedir ayuda](#12-cómo-pedir-ayuda)

---

## 0. Antes de empezar (prerequisitos)

| Requisito | Cómo verificar |
|---|---|
| Node.js >= 18 | `node --version` |
| npm >= 9 | `npm --version` |
| Git instalado | `git --version` |
| Acceso al repo `SplitSnap-FrontEnd` | Login en GitHub |
| Tu épica asignada del Word de planificación | F1, F2, F3 o F5 |

**Backend**: ya está desplegado en Railway. No necesitas levantarlo localmente. URL pública:

```
https://splitsnap-backend-production-7213.up.railway.app
```

Puedes probar que está vivo abriendo Swagger:
```
https://splitsnap-backend-production-7213.up.railway.app/swagger-ui/index.html
```

---

## 1. Setup local en 5 minutos

```bash
# 1. Clonar
git clone https://github.com/Carlos-Huane/SplitSnap-FrontEnd.git
cd SplitSnap-FrontEnd

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env con la URL del backend
cp .env.example .env

# 4. Editar .env y verificar que tiene:
# VITE_API_URL=https://splitsnap-backend-production-7213.up.railway.app

# 5. Arrancar el dev server
npm run dev
```

Si todo va bien, en tu navegador se abre `http://localhost:5173` con la app corriendo.

> 💡 El archivo `.env` está en `.gitignore` — no se sube al repo. Cada integrante tiene el suyo.

---

## 2. Tu primer login real (validar conexión)

Antes de tocar código, valida que tu setup funciona haciendo un login real desde el frontend.

### Opción A — Por consola del navegador (no necesitas que F1 esté listo)

1. Arranca el frontend con `npm run dev`
2. Abre `http://localhost:5173` en el navegador
3. DevTools (F12) → pestaña **Console**
4. Pega y ejecuta:

```js
// Login contra el backend de Railway
const res = await fetch('https://splitsnap-backend-production-7213.up.railway.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'carlos@splitsnap.com', password: 'test123' })
})
const data = await res.json()
console.log('Token recibido:', data.token)
console.log('Usuario:', data.user)

// Guardar el token en localStorage para que el cliente axios lo use
localStorage.setItem('splitsnap_token', data.token)
console.log('✓ Token guardado en localStorage')
```

Si ves el token y el usuario → **estás conectado**. Si ves un error CORS o network → revisa tu `.env`.

### Opción B — Cuando F1 (Marcela) esté mergeada

Simplemente vas a `/login` en el frontend y usas:

| Email | Password |
|---|---|
| `carlos@splitsnap.com` | `test123` |
| `ana@splitsnap.com` | `test123` |
| `juan@splitsnap.com` | `test123` |

---

## 3. Patrón estándar de integración

Toda pantalla sigue el mismo patrón: **importar el servicio del dominio → llamar la función → manejar loading/error → actualizar UI**.

### 3.1 Estructura de los servicios

Todos los servicios viven en `src/services/`. Ya están creados en F0 con los endpoints documentados:

```
src/services/
├── api.js                  ← Cliente axios + interceptores (NO TOCAR)
├── auth.service.js         ← login, register, logout, decodeToken
├── users.service.js        ← getMe, updateMe, uploadAvatar, search
├── groups.service.js       ← getMyGroups, createGroup, getGroup, addMember, removeMember
├── expenses.service.js     ← getExpensesByGroup, createExpense, scanReceipt
├── debts.service.js        ← getDebts, markAsPaid, payWithCredits
├── credits.service.js      ← getCredits, buyCredits
└── transactions.service.js ← getTransactions
```

### 3.2 Patrón básico (copiar/pegar y adaptar)

```jsx
import { useEffect, useState } from 'react'
import { getMyGroups } from '../../services/groups.service'  // ← cambia por tu servicio
import { extractErrorMessage } from '../../services/api'

function MiPantalla() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    getMyGroups()                              // ← cambia por tu llamada
      .then((response) => {
        if (cancelled) return
        setData(response)
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(extractErrorMessage(err, 'Mensaje de fallback'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  if (loading) return <p>Cargando...</p>
  if (error) return <p className="error">{error}</p>
  if (!data) return null

  return (
    <div>
      {/* Tu UI aquí */}
    </div>
  )
}
```

### 3.3 Patrón para enviar datos (POST / PUT)

```jsx
const handleSubmit = async () => {
  if (!validate()) return  // tu validación cliente

  setSubmitting(true)
  setSubmitError(null)
  try {
    const result = await createGroup({ name, emoji, memberIds })
    navigate(`/groups/${result.id}`)
  } catch (err) {
    setSubmitError(extractErrorMessage(err, 'No pudimos crear el grupo.'))
  } finally {
    setSubmitting(false)
  }
}
```

### 3.4 Cómo se autentica cada request

El cliente axios (`api.js`) **inyecta el JWT automáticamente** en cada request si está en localStorage. Tú no tienes que pasarlo en cada llamada.

Cuando llegue F1 (login real), el flow será:
1. Usuario hace login → `authService.login(email, password)` guarda token en localStorage
2. Cualquier request posterior trae el header `Authorization: Bearer <token>` automáticamente
3. Si el token expira → axios recibe 401 → emite evento `auth:expired` → AppContext dispatch LOGOUT → redirige a `/login`

---

## 4. Guía F1 — Auth y Perfil (Marcela)

### HU-F1.1 — Register

**Archivo a tocar**: `src/pages/Register.jsx` (o similar)

```jsx
import { register } from '../../services/auth.service'
import { useApp } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'

function Register() {
  const navigate = useNavigate()
  const { dispatch } = useApp()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const { token, user } = await register(form)
      // El AppContext acepta token en el LOGIN action (lo guarda en localStorage automáticamente)
      dispatch({ type: 'LOGIN', userId: user.id, user, token })
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Este email ya está registrado.')
      } else {
        setError(extractErrorMessage(err, 'No pudimos crear tu cuenta.'))
      }
    } finally {
      setSubmitting(false)
    }
  }
  // ... resto del componente
}
```

### HU-F1.2 — Login

```jsx
import { login } from '../../services/auth.service'

const handleLogin = async (e) => {
  e.preventDefault()
  setSubmitting(true)
  try {
    const { token, user } = await login({ email, password })
    dispatch({ type: 'LOGIN', userId: user.id, user, token })
    navigate('/dashboard')
  } catch (err) {
    if (err.response?.status === 401) {
      setError('Credenciales incorrectas.')
    } else {
      setError(extractErrorMessage(err))
    }
  } finally {
    setSubmitting(false)
  }
}
```

### HU-F1.3 — Perfil

```jsx
import { getMe, updateMe, uploadAvatar } from '../../services/users.service'

// Cargar al montar
useEffect(() => {
  getMe().then(setUser).catch(handleError)
}, [])

// Actualizar
const handleSave = async (changes) => {
  const updated = await updateMe(changes)
  setUser(updated)
}

// Avatar
const handleAvatarChange = async (file) => {
  const { avatarUrl } = await uploadAvatar(file)
  setUser(prev => ({ ...prev, avatarUrl }))
}
```

### HU-F1.4 — Créditos

```jsx
import { getCredits, buyCredits } from '../../services/credits.service'

const [credits, setCredits] = useState({ balance: 0, history: [] })

useEffect(() => {
  getCredits().then(setCredits)
}, [])

const handleBuy = async (amount) => {
  const { newBalance } = await buyCredits(amount)
  setCredits(prev => ({ ...prev, balance: newBalance }))
}
```

### Endpoints reales del backend

| Endpoint | Método | Body / Params | Response |
|---|---|---|---|
| `/api/auth/register` | POST | `{ name, email, phone?, password }` | `{ token, user }` |
| `/api/auth/login` | POST | `{ email, password }` | `{ token, user }` |
| `/api/users/me` | GET | — | `{ id, name, email, phone, avatarUrl, credits }` |
| `/api/users/me` | PUT | `{ name?, email?, phone?, currentPassword?, newPassword? }` | `{ user }` |
| `/api/users/me/avatar` | PUT | `multipart/form-data` con `file` | `{ avatarUrl }` |
| `/api/users/me/credits` | GET | — | `{ balance, history[] }` |
| `/api/users/me/credits/buy` | POST | `{ amount }` | `{ newBalance, transaction }` |

---

## 5. Guía F2 — Grupos (Obed)

### HU-F2.1 — Listar grupos

**Archivo**: `src/pages/Dashboard.jsx` y/o `src/pages/GroupList.jsx`

```jsx
import { getMyGroups } from '../../services/groups.service'

const [groups, setGroups] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  getMyGroups()
    .then(setGroups)
    .finally(() => setLoading(false))
}, [])

// Si no hay grupos → navegar a /empty
useEffect(() => {
  if (!loading && groups.length === 0) navigate('/empty')
}, [loading, groups, navigate])
```

> ⚠️ **Gap conocido**: `getMyGroups()` NO devuelve `myBalance`. Calcúlalo del lado del front sumando las deudas pendientes del usuario actual, o muestra `S/ 0.00` como placeholder.

### HU-F2.2 — Crear grupo

**Archivo**: `src/pages/CreateGroup.jsx`

```jsx
import { createGroup } from '../../services/groups.service'

const handleCreate = async () => {
  if (!name.trim()) {
    setError('Ingresa un nombre.')
    return
  }
  setSubmitting(true)
  try {
    const newGroup = await createGroup({
      name: name.trim(),
      emoji: emoji || '📦',
      memberIds: selectedMemberIds  // array vacío si no agregas miembros iniciales
    })
    navigate(`/groups/${newGroup.id}`)
  } catch (err) {
    setError(extractErrorMessage(err, 'No pudimos crear el grupo.'))
  } finally {
    setSubmitting(false)
  }
}
```

### HU-F2.3 — Invitar miembros

**Archivo**: `src/pages/InviteMembers.jsx`

```jsx
import { search as searchUsers } from '../../services/users.service'
import { addMember } from '../../services/groups.service'

// Búsqueda con debounce
const [query, setQuery] = useState('')
const [results, setResults] = useState([])

useEffect(() => {
  if (query.trim().length < 2) {
    setResults([])
    return
  }
  const timer = setTimeout(() => {
    searchUsers(query.trim())
      .then(setResults)
      .catch(() => setResults([]))
  }, 300)
  return () => clearTimeout(timer)
}, [query])

// Invitar
const handleInvite = async (userId) => {
  try {
    await addMember(groupId, userId)
    alert('Miembro agregado')
  } catch (err) {
    if (err.response?.status === 409) {
      alert('Ese usuario ya es miembro del grupo.')
    } else {
      alert(extractErrorMessage(err))
    }
  }
}
```

### Endpoints reales

| Endpoint | Método | Body / Params | Response |
|---|---|---|---|
| `/api/groups` | GET | — | `[{ id, name, emoji, memberCount, members[] }]` |
| `/api/groups` | POST | `{ name, emoji?, memberIds[] }` | `{ id, name, emoji, members[] }` |
| `/api/groups/{id}` | GET | — | `{ id, name, emoji, createdBy, members[] }` |
| `/api/groups/{id}/members` | POST | `{ userId }` | `{ id, name, members[] }` |
| `/api/groups/{id}/members/{userId}` | DELETE | — | 204 No Content |
| `/api/users/search?q=...` | GET | `q` (min 2 chars) | `[{ id, name, email, avatarUrl }]` |

---

## 6. Guía F3 — Detalle de Grupo y Gastos (Yorma)

### HU-F3.1 — Detalle del grupo

**Archivo**: `src/pages/GroupDetail.jsx`

```jsx
import { getGroup } from '../../services/groups.service'
import { getExpensesByGroup } from '../../services/expenses.service'
import { useParams } from 'react-router-dom'

const { id: groupId } = useParams()
const [group, setGroup] = useState(null)
const [expenses, setExpenses] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  let cancelled = false
  Promise.all([
    getGroup(groupId),
    getExpensesByGroup(groupId),
  ])
    .then(([g, exps]) => {
      if (cancelled) return
      setGroup(g)
      setExpenses(exps)
    })
    .catch((err) => {
      if (cancelled) return
      if (err.response?.status === 403) {
        setError('No tienes acceso a este grupo.')
      } else {
        setError(extractErrorMessage(err))
      }
    })
    .finally(() => { if (!cancelled) setLoading(false) })
  return () => { cancelled = true }
}, [groupId])
```

> ⚠️ **Gap conocido**: el listado `getExpensesByGroup` NO incluye `splitBetween[]` en cada gasto. Si necesitas mostrar el detalle de un gasto al hacer clic, llama a `getExpenseDetail(groupId, expenseId)` para traer los splits.

### HU-F3.2 — Agregar gasto manual

**Archivo**: `src/pages/AddExpense.jsx`

```jsx
import { createExpense } from '../../services/expenses.service'
import { getCurrentUserFromToken } from '../../services/auth.service'

const currentUser = getCurrentUserFromToken()

const handleSubmit = async () => {
  // Validación cliente
  const total = parseFloat(amount)
  const splitsSum = splits.reduce((acc, s) => acc + s.amount, 0)
  if (Math.abs(splitsSum - total) > 0.01) {
    setError(`La suma de los splits (${splitsSum}) no coincide con el monto total (${total})`)
    return
  }

  setSubmitting(true)
  try {
    await createExpense(groupId, {
      description: description.trim(),
      amount: total,
      paidBy: paidByUserId,  // o currentUser.id por default
      date: new Date().toISOString().split('T')[0],
      splitBetween: splits.map(s => ({ userId: s.userId, amount: s.amount })),
    })
    navigate(`/groups/${groupId}`)
  } catch (err) {
    setError(extractErrorMessage(err))
  } finally {
    setSubmitting(false)
  }
}
```

### Endpoints reales

| Endpoint | Método | Body / Params | Response |
|---|---|---|---|
| `/api/groups/{id}` | GET | — | `{ id, name, emoji, members[] }` |
| `/api/groups/{id}/expenses` | GET | — | `[{ id, description, amount, paidBy, expenseDate }]` |
| `/api/groups/{id}/expenses` | POST | `{ description, amount, paidBy, date, splitBetween[] }` | `{ id, description, amount, ... }` |
| `/api/groups/{id}/expenses/{expenseId}` | GET | — | `{ id, ..., splits[] }` |

---

## 7. Guía F5 — Deudas y Pagos (Dafne)

### HU-F5.1 — Resumen de deudas

**Archivo**: `src/pages/DebtSummary.jsx`

```jsx
import { getDebts } from '../../services/debts.service'

const [debts, setDebts] = useState({ pending: [], paid: [] })

useEffect(() => {
  Promise.all([
    getDebts(groupId, 'PENDING'),
    getDebts(groupId, 'PAID'),
  ]).then(([pending, paid]) => {
    setDebts({ pending, paid })
  })
}, [groupId])
```

> ⚠️ **Adapter del front**: el backend devuelve `DebtResponse.fromUser: { id, name, email, avatarUrl }` (objeto anidado). El mock del frontend usa `fromUserId` (flat). Adapta:
>
> ```jsx
> const adaptedDebts = pending.map(d => ({
>   ...d,
>   fromUserId: d.fromUser.id,
>   fromUserName: d.fromUser.name,
>   toUserId: d.toUser.id,
>   toUserName: d.toUser.name,
> }))
> ```

### HU-F5.2 — Marcar como pagada

```jsx
import { markAsPaid } from '../../services/debts.service'

const handleMarkPaid = async (debtId, paidWith) => {
  // paidWith: 'yape' | 'paypal' | 'efectivo'
  try {
    const updated = await markAsPaid(groupId, debtId, paidWith)
    // refrescar lista
    refresh()
  } catch (err) {
    if (err.response?.status === 403) {
      alert('Solo el deudor puede marcar esta deuda como pagada.')
    } else if (err.response?.status === 409) {
      alert('Esta deuda ya estaba pagada.')
    } else {
      alert(extractErrorMessage(err))
    }
  }
}
```

### HU-F5.3 — Pagar con créditos

```jsx
import { payWithCredits } from '../../services/debts.service'

const handlePayWithCredits = async (debtId) => {
  try {
    await payWithCredits(groupId, debtId)
    refresh()
  } catch (err) {
    if (err.response?.status === 400) {
      const msg = err.response.data.message
      if (msg.includes('insuficientes')) {
        // mostrar link a /profile para comprar créditos
        alert('No tienes suficientes créditos. Compra más desde tu perfil.')
      } else {
        alert(msg)
      }
    } else {
      alert(extractErrorMessage(err))
    }
  }
}
```

### Endpoints reales

| Endpoint | Método | Body / Params | Response |
|---|---|---|---|
| `/api/groups/{id}/debts?status=PENDING\|PAID` | GET | filtro opcional | `[{ id, fromUser, toUser, amount, status, paidWith }]` |
| `/api/groups/{id}/debts/{debtId}/mark-paid` | PUT | `{ paidWith }` | `{ debt actualizada }` |
| `/api/groups/{id}/debts/{debtId}/pay-credits` | PUT | — | `{ debt actualizada }` |

---

## 8. Manejo de errores HTTP

Todos los errores siguen el formato:
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Mensaje legible para el usuario",
  "timestamp": "2026-05-31T10:00:00"
}
```

Patrón estándar:
```jsx
try {
  await algunaLlamada()
} catch (err) {
  // err.response.status → código HTTP
  // err.response.data.message → mensaje del backend
  setError(extractErrorMessage(err, 'Fallback genérico'))
}
```

### Códigos HTTP comunes

| Código | Significado | Cómo manejarlo |
|---|---|---|
| **400** | Bad Request (validación, créditos insuficientes) | Mostrar `err.response.data.message` |
| **401** | No autenticado o token expirado | **Automático**: el interceptor de axios limpia el token y redirige a `/login` |
| **403** | No tienes permiso (no eres miembro, no eres el creador, etc.) | "No tienes acceso a este recurso" |
| **404** | Recurso no encontrado | "No encontramos lo que buscas" |
| **409** | Conflicto (email duplicado, ya es miembro, ya está pagada) | Mensaje específico según el contexto |
| **500** | Error del servidor | "Algo salió mal, intenta de nuevo" |
| **Sin response** | Backend caído o sin internet | El interceptor emite `app:network-error` |

---

## 9. Gaps conocidos del backend

Estos NO bloquean el sprint — son features que la spec del BACKLOG pide y aún no están en el back. Workaround:

| Gap | Workaround |
|---|---|
| `myBalance` no viene en `GET /api/groups` | Calcular del lado del front sumando deudas pendientes del usuario actual |
| `recentExpenses[]` y `memberBalances[]` no vienen en el detalle del grupo | Llamada adicional a `/api/groups/{id}/expenses` |
| `splitBetween[]` no viene en el listado de gastos | Para mostrar detalle al hacer clic, llamar a `/api/groups/{id}/expenses/{expenseId}` |
| Filtros `?from=` y `?to=` en transacciones | No hay todavía; si se necesitan, agregarlos al backend después |

---

## 10. Convenciones de branches y commits

### Branches

```
feature/F<numero>-<nombre-corto>
```

Ejemplos:
- `feature/F1-auth`
- `feature/F2-groups`
- `feature/F3-detail-and-expenses`
- `feature/F5-debts-payments`

### Commits (Conventional Commits)

```
feat(F1):     nueva pantalla integrada
fix(F2):      bug en listado de grupos
refactor(F3): mejora del componente AddExpense
docs(F5):     actualización de README
chore:        dependencias, configuración
```

### Pull Requests

- Target branch: **`develop`** (no `main`)
- Título: `feat(F1): conectar Login y Register al backend` (o similar)
- Body: describe qué pantallas tocaste, qué endpoints consumiste, screenshots si aplica
- Espera mínimo 1 aprobación antes de mergear

---

## 11. Debugging

### El backend responde 401 a todo

Verifica que tienes un token válido en localStorage:
```js
localStorage.getItem('splitsnap_token')
```

Si está null o vacío → necesitas hacer login. Si está, copia el token y pégalo en `https://jwt.io` para ver si está expirado.

### No me llega el JWT en las requests

Abre DevTools → Network → click en una request → pestaña Headers → busca `Authorization`. Si no aparece, el interceptor no se está disparando — verifica que estás importando desde `services/api.js`.

### CORS error

Si ves `Access-Control-Allow-Origin` en la consola → el backend no tiene tu URL en `CORS_ORIGINS`. Avisa a Carlos para que lo agregue en Railway.

### El backend "duerme" o tarda mucho

Railway no tiene cold start con el plan Hobby, pero si la app NO tuvo tráfico en mucho tiempo el primer request puede tardar 2-3 segundos. Es normal.

### Ver los logs del backend

Si necesitas ver qué está pasando del lado del back, abre Railway → cuadrito del backend → pestaña **Deployments** → click en el deploy actual → **Deploy Logs**.

---

## 12. Cómo pedir ayuda

1. **Antes de preguntar**: revisa esta guía + el README del repo.
2. **Cuando preguntes**, incluye:
   - Qué intentabas hacer
   - Qué error viste (captura o copy/paste del mensaje completo)
   - Qué endpoint estabas llamando
   - El body que enviaste (si aplica)
   - Tu branch actual
3. **Canal**: el grupo del equipo o directamente a Carlos.

---

*Guía generada para el sprint de integración Frontend de SplitSnap — Backend desplegado en Railway.*
