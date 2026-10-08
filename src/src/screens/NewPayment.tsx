import { useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Method, type Status } from '../db'
import { formatDate, METHODS, methodLabel, money, parseAmount, STATUSES, today } from '../format'
import { go } from '../App'
import { Pill } from './Payments'

const NEW = '__new__'

export default function NewPayment({ userId }: { userId: number }) {
  const apps = useLiveQuery(() => db.apps.where('userId').equals(userId).sortBy('name'), [userId]) ?? []
  const clients = useLiveQuery(() => db.clients.where('userId').equals(userId).sortBy('name'), [userId]) ?? []

  const [appSel, setAppSel] = useState('')
  const [newApp, setNewApp] = useState('')
  const [client, setClient] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today)
  const [method, setMethod] = useState<Method>('transfer')
  const [reference, setReference] = useState('')
  const [status, setStatus] = useState<Status>('paid')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const cents = parseAmount(amount)
  const appName = appSel === NEW ? newApp.trim() : apps.find((a) => String(a.id) === appSel)?.name ?? ''

  async function submit(e: FormEvent) {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (!appName) er.app = appSel === NEW ? 'Escribe el nombre de la aplicación' : 'Selecciona la aplicación'
    if (!client.trim()) er.client = 'Escribe el nombre del cliente'
    if (cents === null) er.amount = 'Escribe un monto válido, por ejemplo 450.00'
    else if (cents <= 0) er.amount = 'El monto debe ser mayor a 0'
    if (!date) er.date = 'Selecciona la fecha del pago'
    setErrors(er)
    if (Object.keys(er).length) return

    setBusy(true)
    try {
      await db.transaction('rw', db.apps, db.clients, db.payments, async () => {
        const appId = appSel === NEW
          ? ((await db.apps.where('[userId+name]').equals([userId, appName]).first())?.id ?? (await db.apps.add({ userId, name: appName })))
          : Number(appSel)
        const name = client.trim()
        const clientId = (await db.clients.where('[userId+name]').equals([userId, name]).first())?.id ?? (await db.clients.add({ userId, name }))
        const now = new Date().toISOString()
        await db.payments.add({
          userId, appId, clientId, amountCents: cents!, currency: 'USD', paidAt: date, method,
          reference: reference.trim() || null, status, note: note.trim() || null, createdAt: now, updatedAt: now,
        })
      })
      go('/pagos')
    } finally {
      setBusy(false)
    }
  }

  const err = (f: string) => errors[f] && <p className="error" id={`${f}-err`} role="alert">{errors[f]}</p>
  const inv = (f: string) => ({ 'aria-invalid': !!errors[f], 'aria-describedby': errors[f] ? `${f}-err` : undefined })

  return (
    <>
      <header className="page-head"><h1>Nuevo pago</h1></header>
      <div className="split">
        <form className="card form" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="app">Aplicación</label>
            <select id="app" value={appSel} onChange={(e) => setAppSel(e.target.value)} {...inv('app')}>
              <option value="">Selecciona…</option>
              {apps.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              <option value={NEW}>＋ Nueva aplicación…</option>
            </select>
            {appSel === NEW && <input aria-label="Nombre de la nueva aplicación" placeholder="Nombre de la aplicación" value={newApp} onChange={(e) => setNewApp(e.target.value)} autoFocus />}
            {err('app')}
          </div>
          <div className="field">
            <label htmlFor="client">Cliente</label>
            <input id="client" list="clients-list" autoComplete="off" value={client} onChange={(e) => setClient(e.target.value)} {...inv('client')} />
            <datalist id="clients-list">{clients.map((c) => <option key={c.id} value={c.name} />)}</datalist>
            {err('client')}
          </div>
          <div className="grid2">
            <div className="field">
              <label htmlFor="amount">Monto (USD)</label>
              <input id="amount" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} {...inv('amount')} />
              {err('amount')}
            </div>
            <div className="field">
              <label htmlFor="date">Fecha</label>
              <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} {...inv('date')} />
              {err('date')}
            </div>
          </div>
          <div className="grid2">
            <div className="field">
              <label htmlFor="method">Método</label>
              <select id="method" value={method} onChange={(e) => setMethod(e.target.value as Method)}>
                {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="status">Estado</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="reference">Referencia <span className="muted">(opcional)</span></label>
            <input id="reference" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="note">Nota <span className="muted">(opcional)</span></label>
            <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="actions">
            <button type="button" className="btn" onClick={() => go('/pagos')}>Cancelar</button>
            <button type="submit" className="btn primary" disabled={busy}>Guardar pago{cents && cents > 0 ? ` · ${money(cents)}` : ''}</button>
          </div>
        </form>

        <aside className="card preview" aria-label="Vista previa del pago">
          <h2>Resumen</h2>
          <dl>
            <dt>Aplicación</dt><dd>{appName || '—'}</dd>
            <dt>Cliente</dt><dd>{client.trim() || '—'}</dd>
            <dt>Fecha</dt><dd>{date ? formatDate(date) : '—'}</dd>
            <dt>Método</dt><dd>{methodLabel(method)}</dd>
            <dt>Referencia</dt><dd>{reference.trim() || '—'}</dd>
            <dt>Estado</dt><dd><Pill status={status} /></dd>
          </dl>
          <div className="preview-total"><span className="kpi-label">Monto</span><strong>{cents !== null ? money(cents) : '$0.00'}</strong></div>
        </aside>
      </div>
    </>
  )
}
