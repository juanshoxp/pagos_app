import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Status } from '../db'
import { formatDate, methodLabel, money, statusLabel, today } from '../format'
import Icon from '../components/Icon'

export function Pill({ status }: { status: Status }) {
  return <span className={`pill ${status}`}>{statusLabel(status)}</span>
}

export default function Payments({ userId }: { userId: number }) {
  const [q, setQ] = useState('')
  const data = useLiveQuery(async () => {
    const [payments, apps, clients] = await Promise.all([
      db.payments.where('userId').equals(userId).toArray(),
      db.apps.where('userId').equals(userId).toArray(),
      db.clients.where('userId').equals(userId).toArray(),
    ])
    const appName = new Map(apps.map((a) => [a.id!, a.name]))
    const clientName = new Map(clients.map((c) => [c.id!, c.name]))
    return payments
      .map((p) => ({ ...p, app: appName.get(p.appId) ?? '—', client: clientName.get(p.clientId) ?? '—' }))
      .sort((a, b) => b.paidAt.localeCompare(a.paidAt) || b.id! - a.id!)
  }, [userId])

  const rows = data ?? []
  const kpi = useMemo(() => {
    const sum = (s: Status) => rows.filter((r) => r.status === s).reduce((t, r) => t + r.amountCents, 0)
    const month = today().slice(0, 7)
    return { paid: sum('paid'), pending: sum('pending'), overdue: sum('overdue'), month: rows.filter((r) => r.paidAt.startsWith(month)).length }
  }, [rows])

  const needle = q.trim().toLowerCase()
  const shown = needle ? rows.filter((r) => r.client.toLowerCase().includes(needle) || r.app.toLowerCase().includes(needle)) : rows

  return (
    <>
      <header className="page-head">
        <h1>Pagos</h1>
        <a className="btn primary" href="#/nuevo">Registrar pago</a>
      </header>

      <section className="kpis" aria-label="Resumen">
        <div className="card kpi"><span className="kpi-label">Cobrado</span><strong>{money(kpi.paid)}</strong></div>
        <div className="card kpi"><span className="kpi-label">Pendiente</span><strong>{money(kpi.pending)}</strong></div>
        <div className="card kpi"><span className="kpi-label">Vencido</span><strong className="danger-text">{money(kpi.overdue)}</strong></div>
        <div className="card kpi"><span className="kpi-label">Pagos del mes</span><strong>{kpi.month}</strong></div>
      </section>

      <div className="search">
        <Icon name="search" size={18} />
        <input type="search" aria-label="Buscar por cliente o aplicación" placeholder="Buscar por cliente o app" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {data && shown.length === 0 ? (
        <div className="card empty">
          <p>{rows.length === 0 ? 'Aún no has registrado pagos.' : 'Ningún pago coincide con tu búsqueda.'}</p>
          {rows.length === 0 && <a className="btn primary" href="#/nuevo">Registrar el primero</a>}
        </div>
      ) : (
        <>
          <div className="card table-wrap">
            <table>
              <thead>
                <tr><th>App</th><th>Cliente</th><th>Fecha</th><th>Método</th><th className="num">Monto</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id}>
                    <td>{r.app}</td><td>{r.client}</td><td>{formatDate(r.paidAt)}</td><td>{methodLabel(r.method)}</td>
                    <td className="num">{money(r.amountCents)}</td><td><Pill status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="cards">
            {shown.map((r) => (
              <li key={r.id} className="card pay-card">
                <div className="row-between"><strong>{r.client}</strong><strong className="num">{money(r.amountCents)}</strong></div>
                <div className="muted small">{r.app} · {methodLabel(r.method)}</div>
                <div className="row-between"><span className="muted small">{formatDate(r.paidAt)}</span><Pill status={r.status} /></div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
