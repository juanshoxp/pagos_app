import { useState, type FormEvent } from 'react'
import { FieldError, login, register } from '../auth'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'

export default function Login({ onAuth }: { onAuth: (userId: number) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [keep, setKeep] = useState(true)
  const [err, setErr] = useState<{ field: string; message: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [forgot, setForgot] = useState(false)
  const reg = mode === 'register'

  async function submit(e: FormEvent) {
    e.preventDefault()
    setErr(null)
    setBusy(true)
    try {
      onAuth(reg ? await register(email, password, confirm, keep) : await login(email, password, keep))
    } catch (x) {
      setErr(x instanceof FieldError ? { field: x.field, message: x.message } : { field: 'form', message: 'No se pudo completar la acción. Inténtalo de nuevo.' })
    } finally {
      setBusy(false)
    }
  }

  const switchMode = () => { setMode(reg ? 'login' : 'register'); setErr(null); setForgot(false) }
  const fieldErr = (f: string) => err?.field === f && <p className="error" id={`${f}-err`} role="alert">{err.message}</p>

  return (
    <div className="login">
      <div className="login-top"><ThemeToggle /></div>
      <form className="card login-card" onSubmit={submit} noValidate>
        <Logo height={48} />
        <h1>{reg ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
        <p className="muted">{reg ? 'Tu cuenta se guarda solo en este dispositivo.' : 'Registra y controla los pagos de tus aplicaciones.'}</p>

        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={err?.field === 'email'} aria-describedby={err?.field === 'email' ? 'email-err' : undefined} />
          {fieldErr('email')}
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" autoComplete={reg ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={err?.field === 'password'} aria-describedby={err?.field === 'password' ? 'password-err' : undefined} />
          {fieldErr('password')}
        </div>
        {reg && (
          <div className="field">
            <label htmlFor="confirm">Repite la contraseña</label>
            <input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={err?.field === 'confirm'} aria-describedby={err?.field === 'confirm' ? 'confirm-err' : undefined} />
            {fieldErr('confirm')}
          </div>
        )}
        {err?.field === 'form' && <p className="error" role="alert">{err.message}</p>}

        <div className="row-between">
          <label className="check"><input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} /> Mantener sesión</label>
          {!reg && <button type="button" className="link" onClick={() => setForgot(!forgot)}>¿Olvidaste tu contraseña?</button>}
        </div>
        {forgot && !reg && (
          <p className="notice">Tus datos viven solo en este dispositivo, por eso no se puede recuperar la contraseña por correo. Si no la recuerdas, deberás crear una cuenta nueva.</p>
        )}

        <button className="btn primary block" type="submit" disabled={busy}>{busy ? 'Un momento…' : reg ? 'Crear cuenta' : 'Entrar'}</button>
        <p className="muted center">
          {reg ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <button type="button" className="link" onClick={switchMode}>{reg ? 'Inicia sesión' : 'Regístrate'}</button>
        </p>
      </form>
    </div>
  )
}
