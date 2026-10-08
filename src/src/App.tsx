import { useEffect, useState } from 'react'
import { currentUserId } from './auth'
import Layout from './components/Layout'
import Login from './screens/Login'
import Payments from './screens/Payments'
import NewPayment from './screens/NewPayment'
import Entities from './screens/Entities'
import Settings from './screens/Settings'

export const go = (path: string) => { location.hash = path }

function useRoute() {
  const [route, setRoute] = useState(() => location.hash.slice(1) || '/pagos')
  useEffect(() => {
    const on = () => setRoute(location.hash.slice(1) || '/pagos')
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  return route
}

export default function App() {
  const [userId, setUserId] = useState<number | null>(currentUserId)
  const route = useRoute()

  if (userId === null) {
    return <Login onAuth={(id) => { setUserId(id); go('/pagos') }} />
  }

  const out = () => { setUserId(null); go('/pagos') }
  return (
    <Layout route={route} onLogout={out}>
      {route === '/nuevo' ? <NewPayment userId={userId} />
        : route === '/clientes' ? <Entities userId={userId} kind="clients" />
        : route === '/apps' ? <Entities userId={userId} kind="apps" />
        : route === '/ajustes' ? <Settings userId={userId} onLogout={out} />
        : <Payments userId={userId} />}
    </Layout>
  )
}
