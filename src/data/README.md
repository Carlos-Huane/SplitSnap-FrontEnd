# `src/data/` — Datos locales del frontend

Esta carpeta contiene **toda la data mock** que usa la app mientras no existe el backend. Cada archivo representa una **sección** (ruta o grupo de rutas relacionadas) para que cada integrante del equipo toque solo su archivo.

## Estructura

| Archivo | Sección | Rutas | Responsable |
|---|---|---|---|
| `global.js`    | Datos compartidos | (todas) | Carlos (PM) |
| `auth.js`      | Login / Registro  | `/login`, `/register` | Integrante 4 |
| `dashboard.js` | Inicio            | `/dashboard` | Integrante 1 |
| `groups.js`    | Grupos y subpantallas | `/groups/*`, `/empty` | Integrante 2 |
| `historial.js` | Historial         | `/historial` | Integrante 3 |
| `profile.js`   | Perfil y Privacidad | `/profile` | Integrante 4 |
| `index.js`     | Re-exports        | — | — |

## Reglas

1. **Si el dato solo aparece en tu sección → va en tu archivo.**
2. **Si el dato lo usan varias secciones → va en `global.js`** (usuarios, `currentUser`, categorías). Cualquier cambio acá debe avisarse al equipo.
3. **No dupliques datos.** Si ya existe en `global.js` o en otra sección, impórtalo.
4. **No toques archivos de otras secciones** a menos que estés arreglando un bug que afecta a toda la app (y avisa al equipo antes).

## Cómo usar los datos desde React

Tienes dos formas equivalentes de importar:

```js
// Opción A — desde el archivo específico (recomendado)
import { currentUser } from '../data/global'
import { groups, expenses } from '../data/groups'

// Opción B — todo desde el índice
import { currentUser, groups, expenses } from '../data'
```

### Ejemplo completo: `pages/Dashboard.jsx`

```jsx
import { currentUser } from '../data/global'
import { groups, debts } from '../data/groups'
import { quickActions, summaryCards } from '../data/dashboard'

function Dashboard() {
  const myGroups = groups.filter(g => g.memberIds.includes(currentUser.id))

  const owes = debts
    .filter(d => d.fromUserId === currentUser.id && d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0)

  return (
    <div>
      <h1>Hola, {currentUser.name}</h1>
      <p>Tienes {myGroups.length} grupos activos</p>
      <p>Debes: S/ {owes.toFixed(2)}</p>
    </div>
  )
}
```

### Ejemplo: filtrar por id de ruta en `pages/GroupDetail.jsx`

```jsx
import { useParams } from 'react-router-dom'
import { users } from '../data/global'
import { groups, expenses } from '../data/groups'

function GroupDetail() {
  const { id } = useParams()
  const group = groups.find(g => g.id === id)
  const groupExpenses = expenses.filter(e => e.groupId === id)
  const members = group.memberIds.map(uid => users.find(u => u.id === uid))
  // ...
}
```

## Migración al backend (Sprint 2)

Cuando existan los endpoints de Spring Boot, reemplazaremos los `import { groups } from '../data/groups'` por llamadas `fetch('/api/groups')`. La idea es que **las pantallas no cambien**, solo la fuente de los datos. Por eso es importante mantener los **nombres y estructuras** de los objetos aquí alineados con lo que devolverá el backend.
