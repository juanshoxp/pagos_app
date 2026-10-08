import type { Method, Status } from './db'

const TZ = 'America/Caracas'
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export const METHODS: { value: Method; label: string }[] = [
  { value: 'transfer', label: 'Transferencia' },
  { value: 'mobile', label: 'Pago móvil' },
  { value: 'zelle', label: 'Zelle' },
  { value: 'cash', label: 'Efectivo' },
]
export const STATUSES: { value: Status; label: string }[] = [
  { value: 'paid', label: 'Pagado' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'overdue', label: 'Vencido' },
]
export const methodLabel = (m: Method) => METHODS.find((x) => x.value === m)?.label ?? m
export const statusLabel = (s: Status) => STATUSES.find((x) => x.value === s)?.label ?? s

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const money = (cents: number) => usd.format(cents / 100)

/** Convierte "450", "450.5" o "450,50" a centavos; null si no es válido. */
export function parseAmount(raw: string): number | null {
  const v = raw.trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(v)) return null
  const [int, dec = ''] = v.split('.')
  return Number(int) * 100 + Number(dec.padEnd(2, '0'))
}

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria de Caracas. */
export const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())

export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d} ${MONTHS[Number(m) - 1]} ${y}`
}
