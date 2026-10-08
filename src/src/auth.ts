import { db } from './db'

const KEY = 'session'
const KEEP_MS = 30 * 24 * 60 * 60 * 1000

export class FieldError extends Error {
  constructor(public field: 'email' | 'password' | 'confirm', message: string) {
    super(message)
  }
}

const toHex = (b: ArrayBuffer | Uint8Array) => Array.from(new Uint8Array(b as ArrayBuffer), (x) => x.toString(16).padStart(2, '0')).join('')

async function hash(password: string, salt: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', iterations: 150_000, salt: new TextEncoder().encode(salt) },
    key,
    256,
  )
  return toHex(bits)
}

function saveSession(userId: number, keep: boolean) {
  localStorage.removeItem(KEY)
  sessionStorage.removeItem(KEY)
  if (keep) localStorage.setItem(KEY, JSON.stringify({ userId, expires: Date.now() + KEEP_MS }))
  else sessionStorage.setItem(KEY, JSON.stringify({ userId, expires: Number.MAX_SAFE_INTEGER }))
}

export function currentUserId(): number | null {
  try {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as { userId: number; expires: number }
    return s.expires > Date.now() ? s.userId : null
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem(KEY)
  sessionStorage.removeItem(KEY)
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function register(email: string, password: string, confirm: string, keep: boolean) {
  email = email.trim().toLowerCase()
  if (!EMAIL_RE.test(email)) throw new FieldError('email', 'Escribe un correo válido, por ejemplo juan@correo.com')
  if (password.length < 8) throw new FieldError('password', 'La contraseña debe tener al menos 8 caracteres')
  if (password !== confirm) throw new FieldError('confirm', 'Las contraseñas no coinciden')
  if (await db.users.where('email').equals(email).first()) throw new FieldError('email', 'Ya existe una cuenta con este correo en este dispositivo')
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)))
  const id = await db.users.add({ email, salt, passwordHash: await hash(password, salt), createdAt: new Date().toISOString() })
  saveSession(id, keep)
  return id
}

export async function login(email: string, password: string, keep: boolean) {
  email = email.trim().toLowerCase()
  if (!EMAIL_RE.test(email)) throw new FieldError('email', 'Escribe un correo válido, por ejemplo juan@correo.com')
  if (!password) throw new FieldError('password', 'Escribe tu contraseña')
  const user = await db.users.where('email').equals(email).first()
  if (!user) throw new FieldError('email', 'No hay ninguna cuenta con este correo en este dispositivo')
  if ((await hash(password, user.salt)) !== user.passwordHash) throw new FieldError('password', 'La contraseña no es correcta')
  saveSession(user.id!, keep)
  return user.id!
}
