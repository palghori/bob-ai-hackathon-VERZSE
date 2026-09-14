'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Topbar from '../components/Topbar'
import {
  Activity, AlertTriangle, BarChart3, Bell, Bot, Box, Check, ChevronDown, ChevronRight,
  CloudRain, Cpu, Database, Gauge, HardHat, Layers3, MapPin, Menu, Network, Search,
  Settings, ShieldCheck, SlidersHorizontal, Users, Wrench, X, Zap
} from 'lucide-react'



function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'red' | 'amber' | 'green' | 'blue' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export default function WorkOrders() {
  const [activeNav, setActiveNav] = useState('Work Orders')
  const [mobileNav, setMobileNav] = useState(false)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [crews, setCrews] = useState<any[]>([])
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, crewsRes] = await Promise.all([
          fetch(`http://localhost:4000/api/work-orders`).then(r => r.json()),
          fetch(`http://localhost:4000/api/crews`).then(r => r.json())
        ])
        setOrders(ordersRes.data || [])
        setCrews(crewsRes.data || [])
      } catch (err) {
        console.error('Error fetching data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredOrders = orders.filter(o => filter === 'ALL' || o.status === filter)

  if (loading) return <div className="flex items-center justify-center h-screen w-full"><div className="pulse-dot w-6 h-6" /></div>

  return <>
    <main className="main-area">
      <Topbar />

      <div className="content">
        <div className="page-heading">
          <div>
            <div className="breadcrumb">OPERATIONS / <span>WORK ORDERS</span></div>
            <h1>Maintenance Engine</h1>
            <p>Predictive dispatch and crew management.</p>
          </div>
          <div className="heading-actions">
            <button className="button primary"><Wrench size={15} /> Create Order</button>
          </div>
        </div>

        <div className="dashboard-grid">
          <section className="panel" style={{ gridColumn: 'span 8' }}>
            <div className="panel-head">
              <div>
                <div className="eyebrow">FIELD OPERATIONS</div>
                <h2>Work Orders Queue</h2>
              </div>
              <div className="range-tabs">
                {['ALL', 'NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map((f) => 
                  <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f.replace('_', ' ')}</button>
                )}
              </div>
            </div>
            <div className="table-wrap mt-4">
              <table>
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>ASSET</th>
                    <th>TYPE & PRIORITY</th>
                    <th>STATUS</th>
                    <th>CREW</th>
                    <th>DUE DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.work_order_id}>
                      <td><strong>{order.work_order_id}</strong></td>
                      <td>
                        <div className="asset-name">
                          <div>
                            <Link href={`/assets/${order.asset_id}`}><strong>{order.asset_id}</strong></Link>
                            <span>{order.asset_name}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge tone={order.priority === 'CRITICAL' ? 'red' : order.priority === 'HIGH' ? 'amber' : 'neutral'}>
                          {order.priority}
                        </Badge>
                        <span className="ml-2 text-sm text-slate-400">{order.type}</span>
                      </td>
                      <td>
                        <Badge tone={order.status === 'COMPLETED' ? 'green' : order.status === 'NEW' ? 'red' : 'blue'}>
                          {order.status}
                        </Badge>
                      </td>
                      <td>{order.crew_name || 'Unassigned'}</td>
                      <td>{order.due_date ? new Date(order.due_date).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-slate-400 py-8">No work orders match this filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel" style={{ gridColumn: 'span 4' }}>
            <div className="panel-head">
              <div>
                <div className="eyebrow">RESOURCE MANAGEMENT</div>
                <h2>Crew Status</h2>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {crews.map(crew => (
                <div key={crew.crew_id} className="flex justify-between items-center p-3 bg-[#16202b] rounded border border-[#2a3441]">
                  <div>
                    <div className="flex items-center">
                      <HardHat size={14} className="mr-2 text-slate-400" />
                      <strong className="text-sm">{crew.crew_name}</strong>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{crew.region} · {crew.specialty}</div>
                  </div>
                  <Badge tone={crew.status === 'AVAILABLE' ? 'green' : crew.status === 'EN_ROUTE' ? 'blue' : 'amber'}>
                    {crew.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  </>
}
