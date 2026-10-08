import Dexie, { type Table } from 'dexie'

export type Status = 'paid' | 'pending' | 'overdue'
export type Method = 'transfer' | 'mobile' | 'zelle' | 'cash'

export interface User { id?: number; email: string; salt: string; passwordHash: string; createdAt: string }
export interface AppRow { id?: number; userId: number; name: string }
export interface Client { id?: number; userId: number; name: string }
export interface Payment {
  id?: number
  userId: number
  appId: number
  clientId: number
  /** Monto en centavos (entero) para evitar errores de coma flotante */
  amountCents: number
  currency: 'USD'
  /** Fecha YYYY-MM-DD en zona America/Caracas */
  paidAt: string
  method: Method
  reference: string | null
  status: Status
  note: string | null
  createdAt: string
  updatedAt: string
}

class PagosDB extends Dexie {
  users!: Table<User, number>
  apps!: Table<AppRow, number>
  clients!: Table<Client, number>
  payments!: Table<Payment, number>

  constructor() {
    super('pagos_app')
    this.version(1).stores({
      users: '++id, &email',
      apps: '++id, userId, [userId+name]',
      clients: '++id, userId, [userId+name]',
      payments: '++id, userId, paidAt, status',
    })
  }
}

export const db = new PagosDB()
