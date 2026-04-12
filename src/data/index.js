/**
 * ============================================================
 * ÍNDICE DE DATOS — punto de entrada único
 * ============================================================
 *
 * Re-exporta todo lo de cada sección para que puedas importar
 * desde un solo lugar si así lo prefieres:
 *
 *   import { currentUser, groups, transactions } from '../data'
 *
 * También puedes seguir importando desde el archivo específico:
 *
 *   import { groups } from '../data/groups'
 *   import { currentUser } from '../data/global'
 *
 * Ambas formas funcionan. Usa la que te resulte más clara.
 */

export * from './global'
export * from './auth'
export * from './dashboard'
export * from './groups'
export * from './historial'
export * from './profile'
