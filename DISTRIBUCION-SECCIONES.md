# SplitSnap - Distribución de Secciones por Desarrollador

## Información General del Proyecto

**Proyecto:** SplitSnap - App de gestión de gastos compartidos para universitarios
**Fase actual:** Frontend (solo UI, sin backend)
**Tecnologías:** React 19 + React Router v7 + CSS puro (variables CSS)
**Diseño:** Responsive (móvil 375px / desktop 1440px con Sidebar)

### Estructura del proyecto
```
src/
├── main.jsx                          ← Entry point (NO MODIFICAR)
├── App.jsx                           ← Rutas y layout (NO MODIFICAR sin consultar)
├── App.css                           ← Layout principal
├── styles/
│   ├── variables.css                 ← Tokens de diseño (colores, fuentes, spacing)
│   └── global.css                    ← Estilos base
├── components/shared/
│   ├── Sidebar.jsx                   ← Barra lateral de navegación
│   └── Sidebar.css
└── pages/                            ← AQUÍ TRABAJA CADA DESARROLLADOR
    ├── Splash.jsx                    ← Ya implementado (Carlos)
    ├── Login.jsx + Login.css         ← Ya implementado (Carlos)
    ├── Register.jsx                  ← Persona 1
    ├── Dashboard.jsx                 ← Persona 1
    ├── GroupDetail.jsx               ← Persona 2
    ├── CreateGroup.jsx               ← Persona 2
    ├── InviteMembers.jsx             ← Persona 2
    ├── AddExpense.jsx                ← Persona 2
    ├── ScanReceipt.jsx               ← Persona 2
    ├── ReviewItems.jsx               ← Persona 2
    ├── DebtSummary.jsx               ← Persona 2
    ├── EmptyState.jsx                ← Persona 2
    ├── Historial.jsx                 ← Persona 3
    └── Profile.jsx                   ← Persona 4
```

### Variables CSS disponibles (usar siempre estas, NO hardcodear colores)
```css
--color-primary: #F97316;         /* Naranja principal */
--color-primary-dark: #EA6C0B;    /* Naranja hover */
--color-secondary: #1E1E1E;       /* Negro */
--color-background: #FFFFFF;      /* Fondo blanco */
--color-bg-light: #F5F5F5;        /* Fondo gris claro */
--color-text-primary: #1E1E1E;    /* Texto principal */
--color-text-secondary: #6B7280;  /* Texto secundario */
--color-text-white: #FFFFFF;      /* Texto blanco */
--color-border: #E5E7EB;          /* Bordes */
--color-success: #22C55E;         /* Verde (positivo) */
--color-danger: #EF4444;          /* Rojo (negativo) */
--color-warning: #F59E0B;         /* Amarillo */
--font-sm: 12px;  --font-md: 14px;  --font-lg: 16px;
--font-xl: 20px;  --font-2xl: 24px; --font-3xl: 32px;
--spacing-sm: 8px; --spacing-md: 16px; --spacing-lg: 24px; --spacing-xl: 32px;
--radius-sm: 8px;  --radius-md: 12px; --radius-lg: 16px;
```

### Convenciones de código
- Nombres de archivo: PascalCase (ej: `GroupDetail.jsx`)
- CSS: BEM con prefijo del componente (ej: `.dashboard__balance-card`)
- Cada página tiene su propio archivo `.css` (ej: `Dashboard.css`)
- Importar el CSS al inicio del componente: `import './Dashboard.css'`
- Usar `useNavigate()` de react-router-dom para navegación
- Usar `useParams()` para obtener el `:id` de la URL
- Datos simulados (mock data) directamente en el componente, no en archivos separados

### Flujo Git
1. Crear rama desde `develop`: `git checkout develop && git pull && git checkout -b feature/nombre-seccion`
2. Hacer commits descriptivos: `feat: implementar pantalla de Dashboard`
3. Push de la rama: `git push -u origin feature/nombre-seccion`
4. Crear PR en GitHub: `feature/nombre-seccion` → `develop`
5. Pedir revisión a al menos 1 compañero antes de mergear

---

## PERSONA 1: Sección "Inicio" (Dashboard)

**Rama:** `feature/inicio-dashboard`
**Archivos a modificar:** `src/pages/Dashboard.jsx` + crear `src/pages/Dashboard.css`
**Ruta:** `/dashboard`

### Descripción
Es la pantalla principal de la app. Se muestra después de iniciar sesión. Contiene el saludo al usuario, la tarjeta de balance total y la lista de grupos del usuario.

### Elementos de la pantalla

#### Header
- Texto "Hola, [Nombre]" (usar "Carlos" como dato de prueba)
- Avatar circular en la esquina superior derecha con las iniciales del usuario (ej: "CG")
- Al hacer click en el avatar → **navegar a `/profile`** (sección de Persona 4)

#### Tarjeta de Balance Total
- Fondo naranja (`--color-primary`)
- Texto "Balance total" como etiqueta
- Monto "+$1,250.00" en grande (texto blanco)
- Texto "Te deben en total" como nota inferior

#### Lista de Grupos
- Encabezado "Mis grupos" con link "Ver todos" a la derecha
- Cada grupo es una tarjeta clickeable con:
  - Icono/emoji del grupo (🏠, ✈️, 🍽️)
  - Nombre del grupo
  - Cantidad de miembros
  - Monto total del grupo
- **Al hacer click en un grupo → navegar a `/groups/1`** (sección de Persona 2)

#### Botón FAB (Floating Action Button)
- Botón circular naranja con "+" en la esquina inferior derecha
- **Al hacer click → navegar a `/groups/new`** (sección de Persona 2)

### Datos mock sugeridos
```javascript
const groups = [
  { id: 1, name: 'Departamento 4B', members: 4, amount: '$3,200', emoji: '🏠' },
  { id: 2, name: 'Viaje a Cancún', members: 6, amount: '$8,500', emoji: '✈️' },
  { id: 3, name: 'Cena de cumpleaños', members: 3, amount: '$1,800', emoji: '🍽️' },
]
```

### Navegaciones desde esta pantalla
| Acción | Destino | Responsable |
|--------|---------|-------------|
| Click en avatar | `/profile` | Persona 4 |
| Click en un grupo | `/groups/:id` | Persona 2 |
| Click en botón "+" (FAB) | `/groups/new` | Persona 2 |

### Versión Desktop
- El Sidebar ya está implementado a la izquierda (no lo toques)
- El contenido ocupa el espacio restante
- Los grupos se muestran en grid de 2-3 columnas en lugar de lista vertical
- La tarjeta de balance se extiende al ancho completo

---

## PERSONA 2: Sección "Mis Grupos" (Flujo completo de grupos)

**Rama:** `feature/mis-grupos`
**Archivos a modificar/crear:**
- `src/pages/GroupDetail.jsx` + `GroupDetail.css`
- `src/pages/CreateGroup.jsx` + `CreateGroup.css`
- `src/pages/InviteMembers.jsx` + `InviteMembers.css`
- `src/pages/AddExpense.jsx` + `AddExpense.css`
- `src/pages/ScanReceipt.jsx` + `ScanReceipt.css`
- `src/pages/ReviewItems.jsx` + `ReviewItems.css`
- `src/pages/DebtSummary.jsx` + `DebtSummary.css`
- `src/pages/EmptyState.jsx` + `EmptyState.css`

### NOTA IMPORTANTE
Esta es la sección más grande del proyecto. Incluye 8 pantallas porque todas están interconectadas dentro del flujo de grupos. Se recomienda implementar en este orden:

---

### 2.1 Crear Grupo (`/groups/new`)
**Archivo:** `CreateGroup.jsx`

#### Elementos
- Navbar con flecha "←" que regresa a `/dashboard` y título "Nuevo grupo"
- Círculo naranja con icono de cámara (placeholder para foto del grupo)
- Campo de texto "Nombre del grupo" con placeholder "Ej. Viaje a Barcelona"
- Selector de tipo de grupo con chips: Apartamento, Viaje, Cena, Otro
- Botón "Continuar" al fondo

#### Navegaciones
| Acción | Destino |
|--------|---------|
| Flecha "←" | `/dashboard` (Persona 1) |
| Botón "Continuar" | `/groups/1/invite` (siguiente pantalla) |

---

### 2.2 Invitar Miembros (`/groups/:id/invite`)
**Archivo:** `InviteMembers.jsx`

#### Elementos
- Navbar con "←" y título "Invitar miembros"
- Tarjeta con nombre del grupo e icono
- Campo de email con botón "Invitar"
- Lista de "Miembros invitados" con avatar (inicial + color), nombre y botón "×" para eliminar
- Botón "Crear grupo" al fondo

#### Datos mock
```javascript
const members = [
  { id: 1, name: 'Carlos García', initial: 'C', color: '#F97316' },
  { id: 2, name: 'María López', initial: 'M', color: '#8B5CF6' },
  { id: 3, name: 'Juan Pérez', initial: 'J', color: '#22C55E' },
]
```

#### Navegaciones
| Acción | Destino |
|--------|---------|
| Flecha "←" | `/groups/new` (pantalla anterior) |
| Botón "Crear grupo" | `/groups/1` (detalle del grupo) |

---

### 2.3 Detalle de Grupo (`/groups/:id`)
**Archivo:** `GroupDetail.jsx`

#### Elementos
- Navbar con "←" y nombre del grupo "Departamento 4B"
- **Sección "Balance del grupo":** lista de miembros con su balance individual
  - Positivo en verde (ej: Carlos +$450)
  - Negativo en rojo (ej: María -$200, Juan -$250)
- **Sección "Gastos recientes":** lista de gastos con nombre, fecha y monto
- Dos botones en la parte inferior:
  - "Agregar gasto" → navega a `/groups/1/add-expense`
  - "Escanear recibo" → navega a `/groups/1/scan`

#### Datos mock
```javascript
const members = [
  { name: 'Carlos', balance: 450, color: '#F97316' },
  { name: 'María', balance: -200, color: '#8B5CF6' },
  { name: 'Juan', balance: -250, color: '#22C55E' },
]
const expenses = [
  { name: 'Luz - marzo', date: '15 mar', amount: '$850' },
  { name: 'Internet', date: '10 mar', amount: '$600' },
  { name: 'Agua', date: '5 mar', amount: '$350' },
]
```

#### Navegaciones
| Acción | Destino |
|--------|---------|
| Flecha "←" | `/dashboard` (Persona 1) |
| "Agregar gasto" | `/groups/1/add-expense` |
| "Escanear recibo" | `/groups/1/scan` |
| (Opcional) click en "ver deudas" | `/groups/1/debts` |

---

### 2.4 Agregar Gasto (`/groups/:id/add-expense`)
**Archivo:** `AddExpense.jsx`

#### Elementos
- Navbar con "←" y título "Nuevo gasto"
- Monto grande "$0.00" editable en el centro
- Campo "Descripción del gasto"
- Selector de fecha (mostrar fecha actual como default)
- Sección "¿Quién pagó?" con avatares circulares de los miembros (seleccionable)
- Sección "Dividir gasto" con toggle: "Partes iguales" / "Personalizado"
- Botón "Guardar gasto"

#### Navegaciones
| Acción | Destino |
|--------|---------|
| Flecha "←" | `/groups/1` (detalle del grupo) |
| "Guardar gasto" | `/groups/1` (regresa al detalle) |

---

### 2.5 Escanear Recibo (`/groups/:id/scan`)
**Archivo:** `ScanReceipt.jsx`

#### Elementos
- Navbar con "←" y título "Escanear recibo"
- Fondo oscuro/negro simulando cámara
- Área de visor rectangular (placeholder de cámara)
- Texto "Toma una foto del recibo"
- Botón circular blanco (simular botón de captura)
- Link "Subir desde galería"

#### Navegaciones
| Acción | Destino |
|--------|---------|
| Flecha "←" | `/groups/1` (detalle del grupo) |
| Click en botón de captura | `/groups/1/scan/review` (revisar items) |
| "Subir desde galería" | `/groups/1/scan/review` (revisar items) |

---

### 2.6 Revisar Items del Recibo (`/groups/:id/scan/review`)
**Archivo:** `ReviewItems.jsx`

#### Elementos
- Navbar con "←" y título "Revisar recibo" + subtítulo "Revisa y asigna cada ítem"
- Lista de items escaneados, cada uno con:
  - Nombre del producto
  - Precio
  - Avatares de miembros asignados (circulares, clickeables para asignar/desasignar)
- Total al fondo
- Botón "Confirmar y dividir"

#### Datos mock
```javascript
const items = [
  { name: 'Pizza Margarita', price: 280, assignedTo: ['A', 'M'] },
  { name: 'Pasta Carbonara', price: 220, assignedTo: ['J'] },
  { name: 'Bebidas', price: 150, assignedTo: ['A', 'M', 'J'] },
  { name: 'Propina', price: 100, assignedTo: ['A', 'M', 'J'] },
]
```

#### Navegaciones
| Acción | Destino |
|--------|---------|
| Flecha "←" | `/groups/1/scan` (escanear recibo) |
| "Confirmar y dividir" | `/groups/1/debts` (resumen de deudas) |

---

### 2.7 Resumen de Deudas (`/groups/:id/debts`)
**Archivo:** `DebtSummary.jsx`

#### Elementos
- Navbar con "←", título "Resumen de deudas" y menú "⋮"
- Tarjeta naranja grande con:
  - "Balance total del grupo"
  - Monto "+$1,250.00"
  - Nombre del grupo y cantidad de miembros
- Sección "Deudas pendientes": lista de deudas con:
  - "María → Carlos $450.00" (quién debe a quién)
  - Botones "PayPal" y "Venmo" (simulados)
  - Link "Marcar como pagado"
- Deudas ya pagadas aparecen en verde con texto "Pagado"

#### Navegaciones
| Acción | Destino |
|--------|---------|
| Flecha "←" | `/groups/1` (detalle del grupo) |

---

### 2.8 Estado Vacío (`/empty`)
**Archivo:** `EmptyState.jsx`

#### Elementos
- Navbar con "←" y título "Mis grupos"
- Ilustración central (icono grande naranja de personas con "+")
- Texto "Aún no tienes grupos"
- Subtexto "Crea tu primer grupo y empieza a dividir gastos fácilmente"
- Botón "Crear mi primer grupo"
- Link "Escanea recibos para dividir automáticamente"

#### Navegaciones
| Acción | Destino |
|--------|---------|
| Flecha "←" | `/dashboard` (Persona 1) |
| "Crear mi primer grupo" | `/groups/new` (crear grupo) |

---

### Flujo completo de Persona 2 (diagrama)
```
EmptyState ──────────────────────────┐
                                     ▼
Dashboard (P1) ──→ CreateGroup ──→ InviteMembers ──→ GroupDetail
                                                        │
                                          ┌─────────────┼─────────────┐
                                          ▼             ▼             ▼
                                     AddExpense    ScanReceipt    DebtSummary
                                          │             │
                                          │             ▼
                                          │        ReviewItems
                                          │             │
                                          ▼             ▼
                                     GroupDetail    DebtSummary
```

---

## PERSONA 3: Sección "Historial"

**Rama:** `feature/historial`
**Archivos a modificar:** `src/pages/Historial.jsx` + crear `src/pages/Historial.css`
**Ruta:** `/historial`

### Descripción
Pantalla que muestra el historial de todos los gastos y transacciones realizadas por el usuario, ordenados cronológicamente. Esta pantalla NO tiene diseño previo en Pencil, por lo que debe seguir el estilo visual del resto de la app.

### Elementos sugeridos de la pantalla

#### Header
- Título "Historial" en la parte superior
- (Opcional) Campo de búsqueda para filtrar transacciones
- (Opcional) Filtros: "Todos", "Gastos", "Pagos"

#### Lista de transacciones
Cada transacción debe mostrar:
- Icono o emoji del grupo relacionado
- Nombre del gasto (ej: "Luz - marzo")
- Nombre del grupo (ej: "Departamento 4B")
- Fecha
- Monto (positivo en verde si te pagaron, negativo en rojo si pagaste)

#### Datos mock sugeridos
```javascript
const transactions = [
  { id: 1, type: 'expense', description: 'Luz - marzo', group: 'Departamento 4B', groupEmoji: '🏠', date: '15 mar 2026', amount: -283, },
  { id: 2, type: 'payment', description: 'María te pagó', group: 'Departamento 4B', groupEmoji: '🏠', date: '14 mar 2026', amount: 200, },
  { id: 3, type: 'expense', description: 'Cena en restaurante', group: 'Cena de cumpleaños', groupEmoji: '🍽️', date: '10 mar 2026', amount: -600, },
  { id: 4, type: 'expense', description: 'Vuelos', group: 'Viaje a Cancún', groupEmoji: '✈️', date: '8 mar 2026', amount: -1400, },
  { id: 5, type: 'payment', description: 'Juan te pagó', group: 'Viaje a Cancún', groupEmoji: '✈️', date: '5 mar 2026', amount: 350, },
]
```

### Navegaciones desde esta pantalla
| Acción | Destino |
|--------|---------|
| Click en una transacción | `/groups/:id` (detalle del grupo, Persona 2) |

### Versión Desktop
- Misma información pero con más espacio horizontal
- Considerar mostrar la lista en formato tabla con columnas: Fecha, Descripción, Grupo, Monto
- El Sidebar ya está implementado a la izquierda

### Nota de diseño
Como esta pantalla no tiene mockup en Pencil, seguir estos lineamientos:
- Usar las mismas tarjetas/cards que Dashboard (fondo blanco, border-radius, shadow suave)
- Mantener la paleta naranja para elementos interactivos
- Montos positivos en `--color-success` (verde), negativos en `--color-danger` (rojo)
- Tipografía Inter igual que el resto de la app

---

## PERSONA 4: Sección "Perfil"

**Rama:** `feature/perfil`
**Archivos a modificar/crear:**
- `src/pages/Profile.jsx` + `Profile.css`
- `src/pages/Register.jsx` + `Register.css`
**Rutas:** `/profile` y `/register`

### NOTA
Se incluye la pantalla de Register porque comparte lógica de formulario con el perfil (datos del usuario) y porque Login ya está implementado, así que Register es la contraparte natural.

---

### 4.1 Mi Perfil (`/profile`)
**Archivo:** `Profile.jsx`

#### Elementos
- Navbar con "←" que navega a `/dashboard` y título "Mi perfil"
- Avatar grande circular con iniciales del usuario (fondo naranja)
- Nombre "Carlos García" centrado
- Email "carlos@email.com" debajo del nombre
- Lista de opciones/menú:
  - "Editar perfil" con icono ✏️ y flecha ">"
  - "Métodos de pago" con icono 💳 y flecha ">"
  - "Notificaciones" con icono 🔔 y flecha ">"
  - "Privacidad" con icono 🛡️ y flecha ">"
  - "Cerrar sesión" en rojo con icono y flecha ">"

#### Comportamiento de cada opción
- **Editar perfil:** Puede abrir un modal o una vista inline para editar nombre y email (simulado)
- **Métodos de pago:** Mostrar lista vacía o con datos mock de tarjetas
- **Notificaciones:** Toggle switches para activar/desactivar tipos de notificación
- **Privacidad:** Información estática de privacidad
- **Cerrar sesión:** Navegar a `/login`

#### Navegaciones
| Acción | Destino |
|--------|---------|
| Flecha "←" | `/dashboard` (Persona 1) |
| "Cerrar sesión" | `/login` (ya implementado por Carlos) |

#### Versión Desktop
- Layout de 2 columnas: avatar y datos a la izquierda, opciones a la derecha
- El Sidebar está visible a la izquierda

---

### 4.2 Registro (`/register`)
**Archivo:** `Register.jsx`

#### Elementos
- Mismo layout split que Login (ya implementado):
  - Lado izquierdo naranja con branding en desktop
  - Formulario a la derecha
- Formulario con campos:
  - Nombre completo
  - Correo electrónico
  - Contraseña
  - Confirmar contraseña
- Botón "Crear cuenta"
- Link "¿Ya tienes cuenta? Inicia sesión" → navega a `/login`

#### Navegaciones
| Acción | Destino |
|--------|---------|
| "Crear cuenta" | `/dashboard` (Persona 1) |
| "Inicia sesión" | `/login` (ya implementado) |

#### Referencia de diseño
Copiar la estructura de `Login.jsx` y `Login.css` como base, agregando los campos adicionales. Ambos comparten:
- Layout split responsive (brand izq + form der en desktop, apilado en móvil)
- Mismos estilos de inputs, botón y links

---

## Resumen de distribución

| Persona | Sección | Pantallas | Rama |
|---------|---------|-----------|------|
| Carlos (tú) | Setup base + Splash + Login | 2 implementadas | ✅ Completado |
| Persona 1 | Inicio (Dashboard) | 1 pantalla | `feature/inicio-dashboard` |
| Persona 2 | Mis Grupos (flujo completo) | 8 pantallas | `feature/mis-grupos` |
| Persona 3 | Historial | 1 pantalla | `feature/historial` |
| Persona 4 | Perfil + Register | 2 pantallas | `feature/perfil` |

### Dependencias entre secciones
```
Carlos (Setup) ──→ Todas las demás secciones dependen de esta base

Persona 1 (Dashboard)
  └── Navega a: Persona 2 (grupos), Persona 4 (perfil)

Persona 2 (Mis Grupos)
  └── Recibe navegación de: Persona 1 (dashboard), Persona 3 (historial)
  └── Navega a: Persona 1 (dashboard, al volver atrás)

Persona 3 (Historial)
  └── Navega a: Persona 2 (detalle de grupo)

Persona 4 (Perfil)
  └── Recibe navegación de: Persona 1 (dashboard, click en avatar)
  └── Navega a: Login (cerrar sesión), Persona 1 (dashboard, al volver)
```

### Orden recomendado de desarrollo
1. **Persona 1** y **Persona 4** pueden empezar inmediatamente (no dependen de nadie)
2. **Persona 2** puede empezar inmediatamente (es la más grande, empezar cuanto antes)
3. **Persona 3** puede empezar inmediatamente (pantalla independiente)

Todas las secciones pueden desarrollarse en paralelo ya que los componentes placeholder ya existen y las rutas están configuradas. Los links entre secciones funcionarán automáticamente cuando todos mergeen a `develop`.
