'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Menu, Bell, Database, Calendar } from 'lucide-react'
import Topbar from '../components/Topbar'

export default function IncidentsPage() {
  const [loading, setLoading] = useState(true)
  const [incidents, setIncidents] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:4000/api/incidents`).then(r => r.json())
        setIncidents(res.data || [])
      } catch (err) {
        console.error('Error fetching incidents', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-screen w-full"><div className="pulse-dot w-6 h-6" /></div>

  return <>
    <main className="main-area">
      <Topbar />

      <div className="content">
        <div className="page-heading">
          <div>
            <div className="breadcrumb">OPERATIONS / <span>INCIDENTS</span></div>
            <h1>Historical Event Log</h1>
            <p>Chronological record of grid anomalies and outages.</p>
          </div>
        </div>

        <section className="panel mt-6">
          <div className="panel-head">
            <div>
              <div className="eyebrow">SYSTEM LOG</div>
              <h2>Recorded Incidents</h2>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {incidents.map((inc) => (
              <div key={inc.incident_id} className="p-4 bg-[#16202b] rounded border border-[#2a3441] flex gap-4">
                <div className={`mt-1 p-2 rounded shrink-0 ${inc.incident_type === 'OUTAGE' ? 'bg-red-950 text-red-500' : 'bg-amber-950 text-amber-500'}`}>
                  <AlertTriangle size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold">{(inc.incident_type || 'UNKNOWN').replace('_', ' ')}</h3>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <Calendar size={12} /> {new Date(inc.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded border ${inc.severity === 'CRITICAL' ? 'border-red-900 text-red-500 bg-red-950/30' : 'border-amber-900 text-amber-500 bg-amber-950/30'}`}>
                      {inc.severity}
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-slate-300 bg-[#0d141c] p-3 border border-[#1e2936] rounded">
                    <strong>Asset Affected:</strong> <Link href={`/assets/${inc.asset_id}`} className="text-amber-500 hover:underline">{inc.asset_id}</Link>
                    <p className="mt-2">{inc.description}</p>
                    <div className="mt-2 text-xs text-slate-500">Duration: {inc.duration_minutes} mins · Cost Impact: ${inc.estimated_cost_usd?.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
            {incidents.length === 0 && (
              <div className="text-center text-slate-400 py-8">No historical incidents recorded.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  </>
}
