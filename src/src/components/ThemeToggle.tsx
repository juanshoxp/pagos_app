import { useState } from 'react'
import { isDark, setThemePref } from '../theme'
import Icon from './Icon'

export default function ThemeToggle() {
  const [dark, setDark] = useState(isDark)
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      onClick={() => { setThemePref(dark ? 'light' : 'dark'); setDark(!dark) }}
    >
      <Icon name={dark ? 'sun' : 'moon'} />
    </button>
  )
}
