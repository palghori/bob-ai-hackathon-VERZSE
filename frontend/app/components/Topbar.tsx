'use client'

import { Bell, CloudRain, Cpu, Database, Menu } from 'lucide-react'
import Link from 'next/link'
import { useContext } from 'react'
import { AppShellContext } from './AppShell'
import { usePathname } from 'next/navigation'

export default function Topbar() {
  const { setMobileNav, unreadCount } = useContext(AppShellContext)
  const pathname = usePathname()

  // Simplified topbar for non-dashboard pages
  if (pathname !== '/dashboard') {
    return (
      <header className="topbar">
        <div className="top-status">
          <span><Database size={14} /> Data <b className="status-green">Connected</b></span>
        </div>
        <Link href="/notifications" className="top-alert">
          <Bell size={17} />{unreadCount > 0 && <i>{unreadCount}</i>}
        </Link>
        <Link href="/profile" className="avatar hover-scale">PG</Link>
      </header>
    )
  }

  // Full topbar for Dashboard
  return (
    <header className="topbar">
      <div className="top-status">
        <span><Database size={14} /> Data <b className="status-green">Connected</b></span>
        <span><Cpu size={14} /> ML <b className="status-green">Ready</b></span>
        <span><CloudRain size={14} /> Weather <b className="status-green">Synced</b></span>
        <span className="last-sync">Last sync just now</span>
      </div>
      <Link href="/notifications" className="top-alert">
        <Bell size={17} />{unreadCount > 0 && <i>{unreadCount}</i>}
      </Link>
      <Link href="/profile" className="avatar hover-scale">PG</Link>
    </header>
  )
}
