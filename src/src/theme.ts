export type ThemePref = 'auto' | 'light' | 'dark'

export function getThemePref(): ThemePref {
  try {
    const t = localStorage.getItem('theme')
    return t === 'light' || t === 'dark' ? t : 'auto'
  } catch {
    return 'auto'
  }
}

export function setThemePref(pref: ThemePref) {
  const el = document.documentElement
  if (pref === 'auto') delete el.dataset.theme
  else el.dataset.theme = pref
  try {
    if (pref === 'auto') localStorage.removeItem('theme')
    else localStorage.setItem('theme', pref)
  } catch { /* sin almacenamiento */ }
}

export const isDark = () =>
  document.documentElement.dataset.theme === 'dark' ||
  (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches)
