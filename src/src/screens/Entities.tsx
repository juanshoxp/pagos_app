import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { money } from '../format'

export default function Entities({ userId, kind }: { userId: number; kind: 'clients' | 'apps' }) {
  const rows = useLiveQuery(async () => {
    const [items, payments] = await Promise.all([
      db[kind].where('userId').equals(userId).sortBy('name'),
      db.payments.where('userId').equals(userId).toArray(),
    ])
    const key = kind === 'clients' ? 'clientId' : 'appId'
    return items.map((i) => {
      const mine = payments.filter((p) => p[key] === i.id)
      return {
        id: i.id!, name: i.name, count: mine.length,
        paid: mine.filter((p) => p.status === 'paid').reduce((t, p) => t + p.amountCents, 0),
        open: mine.filter((p) => p.status !== 'paid').reduce((t, p) => t + p.amountCents, 0),
      }
    })
  }, [userId, kind]) ?? []
  const title = kind === 'clients' ? 'Clientes' : 'Aplicaciones'

  return (
    <>
      <header className="page-head"><h1>{title}</h1></header>
      {rows.length === 0 ? (
        <div className="card empty"><p>Se crean automáticamente al registrar pagos.</p></div>
      ) : (
        <ul className="cards always">
          {rows.map((r) => (
            <li key={r.id} className="card pay-card">
              <div className="row-between"><strong>{r.name}</strong><span className="muted small">{r.count} {r.count === 1 ? 'pago' : 'pagos'}</span></div>
              <div className="row-between small"><span className="muted">Cobrado</span><span className="num">{money(r.paid)}</span></div>
              <div className="row-between small"><span className="muted">Por cobrar</span><span className="num">{money(r.open)}</span></div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
