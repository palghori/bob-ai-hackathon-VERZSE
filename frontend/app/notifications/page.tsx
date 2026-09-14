'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, Check, Trash2 } from 'lucide-react'
import Topbar from '../components/Topbar'

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  const [readIds, setReadIds] = useState<Set<number>>(new Set())
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    const savedRead = JSON.parse(localStorage.getItem('gridguard_read_notifs') || '[]')
    const savedDeleted = JSON.parse(localStorage.getItem('gridguard_deleted_notifs') || '[]')
    setReadIds(new Set(savedRead))
    setDeletedIds(new Set(savedDeleted))

    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const res = await fetch('http://localhost:4000/api/alerts').then(r => r.json())
        const allAlerts = res.data || []
        // Filter out deleted ones immediately when setting state
        setNotifications(allAlerts.filter((n: any) => !savedDeleted.includes(n.alert_id)))
      } catch (err) {
        console.error('Failed to load notifications', err)
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  const markAsRead = (id: number) => {
    const next = new Set(readIds).add(id)
    setReadIds(next)
    localStorage.setItem('gridguard_read_notifs', JSON.stringify(Array.from(next)))
    window.dispatchEvent(new Event('gridguard_notifs_changed'))
  }

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.alert_id)
    const next = new Set([...readIds, ...allIds])
    setReadIds(next)
    localStorage.setItem('gridguard_read_notifs', JSON.stringify(Array.from(next)))
    window.dispatchEvent(new Event('gridguard_notifs_changed'))
  }

  const deleteNotification = (id: number) => {
    const next = new Set(deletedIds).add(id)
    setDeletedIds(next)
    localStorage.setItem('gridguard_deleted_notifs', JSON.stringify(Array.from(next)))
    setNotifications(prev => prev.filter(n => n.alert_id !== id))
    window.dispatchEvent(new Event('gridguard_notifs_changed'))
  }

  const clearAll = () => {
    const allIds = notifications.map(n => n.alert_id)
    const next = new Set([...deletedIds, ...allIds])
    setDeletedIds(next)
    localStorage.setItem('gridguard_deleted_notifs', JSON.stringify(Array.from(next)))
    setNotifications([])
    window.dispatchEvent(new Event('gridguard_notifs_changed'))
  }

  if (loading) return <div className="flex items-center justify-center h-screen w-full"><div className="pulse-dot w-6 h-6" /></div>

  return <>
    <main className="main-area">
      <Topbar />

      <div className="content">
        <div className="page-heading">
          <div>
            <div className="breadcrumb">OPERATIONS / <span>NOTIFICATION CENTRE</span></div>
            <h1>Notifications</h1>
            <p>Review system alerts, warnings, and messages.</p>
          </div>
          <div className="heading-actions">
            <button className="button outline" onClick={clearAll}><Trash2 size={15} /> Clear All</button>
            <button className="button primary" onClick={markAllAsRead}><Check size={15} /> Mark All as Read</button>
          </div>
        </div>

        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-[#121a23] rounded border border-[#1e2936]">
              <Bell size={32} className="mx-auto mb-4 opacity-50" />
              <h3>No new notifications</h3>
              <p>You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif: any) => {
                const isRead = readIds.has(notif.alert_id)
                return (
                  <div key={notif.alert_id || Math.random()} className={`p-4 bg-[#16202b] rounded border border-[#2a3441] flex gap-4 transition-all ${isRead ? 'opacity-60' : ''}`}>
                    <div className={`mt-1 p-2 rounded shrink-0 ${notif.severity === 'CRITICAL' ? 'bg-red-950 text-red-500' : 'bg-amber-950 text-amber-500'}`}>
                      <Bell size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        {notif.message}
                        {!isRead && <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>}
                      </h3>
                      <div className="text-xs text-slate-400 mt-1">
                        {new Date(notif.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {!isRead && (
                        <button onClick={() => markAsRead(notif.alert_id)} className="text-xs bg-[#2a3441] hover:bg-blue-600 px-3 py-1 rounded transition-colors text-white flex items-center gap-1">
                          <Check size={12} /> Mark Read
                        </button>
                      )}
                      <button onClick={() => deleteNotification(notif.alert_id)} className="text-xs bg-[#2a3441] hover:bg-red-600 px-3 py-1 rounded transition-colors text-white flex items-center gap-1">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  </>
}
