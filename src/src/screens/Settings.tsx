import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { logout } from '../auth'
import { getThemePref, setThemePref, type ThemePref } from '../theme'

const OPTS: { value: ThemePref; label: string }[] = [
  { value: 'auto', label: 'Automático' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
]

export default function Settings({ userId, onLogout }: { userId: number; onLogout: () => void }) {
  const user = useLiveQuery(() => db.users.get(userId), [userId])
  const [pref, setPref] = useState(getThemePref)
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false)
    addEventListener('online', on); addEventListener('offline', off)
    return () => { removeEventListener('online', on); removeEventListener('offline', off) }
  }, [])

  return (
    <>
      <header className="page-head"><h1>Ajustes</h1></header>
      <section className="card form">
        <div className="field">
          <span className="label" id="theme-label">Tema</span>
          <div className="segmented" role="radiogroup" aria-labelledby="theme-label">
            {OPTS.map((o) => (
              <button key={o.value} type="button" role="radio" aria-checked={pref === o.value} onClick={() => { setThemePref(o.value); setPref(o.value) }}>{o.label}</button>
            ))}
          </div>
        </div>
        <div className="field"><span className="label">Cuenta</span><p>{user?.email}</p></div>
        <div className="field"><span className="label">Conexión</span><p>{online ? 'En línea' : 'Sin conexión'} · los datos se guardan en este dispositivo</p></div>
        <div className="actions"><button className="btn" onClick={() => { logout(); onLogout() }}>Cerrar sesión</button></div>
      </section>
    </>
  )
}
