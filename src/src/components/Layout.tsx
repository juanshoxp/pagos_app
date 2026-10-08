import type { ReactNode } from 'react'
import Icon from './Icon'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

const NAV = [
  { path: '/pagos', label: 'Pagos', icon: 'pagos' },
  { path: '/clientes', label: 'Clientes', icon: 'clientes' },
  { path: '/apps', label: 'Apps', icon: 'apps' },
  { path: '/ajustes', label: 'Ajustes', icon: 'ajustes' },
] as const

export default function Layout({ route, children }: { route: string; children: ReactNode }) {
  const item = (n: (typeof NAV)[number]) => (
    <a key={n.path} href={`#${n.path}`} className="nav-item" aria-current={route === n.path ? 'page' : undefined}>
      <Icon name={n.icon} />
      <span>{n.label}</span>
    </a>
  )
  return (
    <div className="shell">
      <aside className="sidebar">
        <Logo height={40} />
        <nav aria-label="Principal">{NAV.map(item)}</nav>
        <div className="sidebar-foot"><ThemeToggle /></div>
      </aside>
      <main className="content">{children}</main>
      <nav className="tabbar" aria-label="Principal">
        {item(NAV[0])}
        {item(NAV[1])}
        <a href="#/nuevo" className="fab" aria-label="Registrar pago"><Icon name="plus" size={18} /> Registrar</a>
        {item(NAV[2])}
        {item(NAV[3])}
      </nav>
    </div>
  )
}
