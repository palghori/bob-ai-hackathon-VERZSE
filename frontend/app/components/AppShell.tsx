'use client'

import { createContext, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity, AlertTriangle, BarChart3, Bot, Box, ChevronDown, CloudRain, 
  Database, Gauge, Layers3, Network, Settings, SlidersHorizontal, Users, Wrench, X, Zap
} from 'lucide-react'

const nav = [
  ['Command Center', Gauge, '/dashboard'], 
  ['Assets', Box, '/assets'], 
  ['Grid', Network, '/grid'], 
  ['Risk Analytics', BarChart3, '/risk-analytics'],
  ['Condition Monitoring', Activity, '/condition-monitoring'], 
  ['Incidents', AlertTriangle, '/incidents'], 
  ['Weather', CloudRain, '/weather'],
  ['Maintenance', Wrench, '/maintenance'], 
  ['Work Orders', Layers3, '/work-orders'], 
  ['Crews', Users, '/crews'], 
  ['Reports', BarChart3, '/reports'],
  ['Integrations', Database, '/integrations'], 
  ['Simulation', SlidersHorizontal, '/simulation'], 
  ['AI Copilot', Bot, '/copilot'], 
  ['Settings', Settings, '/settings'],
] as const

export const AppShellContext = createContext<{
  setMobileNav: (v: boolean) => void;
  unreadCount: number;
}>({ 
  setMobileNav: () => {},
  unreadCount: 0
})

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const pathname = usePathname()

  // Sync notification count
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const savedDeleted = JSON.parse(localStorage.getItem('gridguard_deleted_notifs') || '[]')
        const savedRead = JSON.parse(localStorage.getItem('gridguard_read_notifs') || '[]')
        
        const res = await fetch('http://localhost:4000/api/alerts').then(r => r.json())
        const allAlerts = res.data || []
        
        const activeAlerts = allAlerts.filter((n: any) => !savedDeleted.includes(n.alert_id))
        const unread = activeAlerts.filter((n: any) => !savedRead.includes(n.alert_id))
        
        setUnreadCount(unread.length)
      } catch (err) {
        console.error('Failed to load notifications count', err)
      }
    }
    
    fetchNotifications()
    
    const handleStorage = () => fetchNotifications()
    window.addEventListener('storage', handleStorage)
    window.addEventListener('gridguard_notifs_changed', handleStorage)
    
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('gridguard_notifs_changed', handleStorage)
    }
  }, [])

  // Determine active nav item from pathname (rough match)
  const getActiveLabel = () => {
    if (pathname === '/dashboard') return 'Command Center'
    if (pathname.startsWith('/assets')) return 'Assets'
    if (pathname.startsWith('/grid')) return 'Grid'
    if (pathname.startsWith('/work-orders')) return 'Work Orders'
    if (pathname.startsWith('/crews')) return 'Crews'
    if (pathname.startsWith('/incidents')) return 'Incidents'
    if (pathname.startsWith('/weather')) return 'Weather'
    const found = nav.find(n => n[2] === pathname)
    return found ? found[0] : ''
  }
  const activeLabel = getActiveLabel()

  if (pathname === '/') {
    return <>{children}</>
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
        <div className="brand">
          <Link href="/" className="brand-link">
            <div className="brand-mark"><Zap size={18} /></div>
            <div><strong>GRIDGUARD</strong><span>OPERATIONS PLATFORM</span></div>
          </Link>
        </div>
        
        <div className="environment">
          <span className="pulse-dot" /> LIVE ENVIRONMENT <span className="demo-label">CONNECTED</span>
        </div>
        
        <nav aria-label="Primary navigation">
          {nav.map(([label, Icon, href]) => (
            <Link 
              href={href as string} 
              key={label as string} 
              className={`nav-item ${activeLabel === label ? 'active' : ''}`} 
              onClick={() => setMobileNav(false)}
            >
              <Icon size={16} />
              <span>{label as string}</span>
              {label === 'Incidents' && <b className="nav-count">3</b>}
            </Link>
          ))}
        </nav>
        
        <div className="sidebar-foot">
          <Link href="/profile" className="operator-mini">
            <div className="avatar">PG</div>
            <div><strong>Pal Ghori</strong><span>Grid Operations</span></div>
            <ChevronDown size={14} />
          </Link>
          <div className="build">
            Decision support prototype<br /><span>v0.8.14 · US-West region</span>
          </div>
        </div>
      </aside>

      <AppShellContext.Provider value={{ setMobileNav, unreadCount }}>
        {children}
      </AppShellContext.Provider>
    </div>
  )
}
