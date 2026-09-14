'use client'

import { useEffect, useState } from 'react'
import { Users, Menu, Bell, Database, CheckCircle, Clock, MapPin, Truck } from 'lucide-react'
import Topbar from '../components/Topbar'

export default function CrewsPage() {
  const [loading, setLoading] = useState(true)
  const [crews, setCrews] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:4000/api/crews`).then(r => r.json())
        setCrews(res.data || [])
      } catch (err) {
        console.error('Error fetching crews', err)
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
            <div className="breadcrumb">OPERATIONS / <span>FIELD CREWS</span></div>
            <h1>Crew Dispatch</h1>
            <p>Live status and geographic locations of all field operations teams.</p>
          </div>
        </div>

        <section className="panel mt-6">
          <div className="panel-head">
            <div>
              <div className="eyebrow">CREW DIRECTORY</div>
              <h2>{crews.length} Active Crews</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {crews.map((crew) => (
              <div key={crew.crew_id} className="p-4 bg-[#16202b] rounded border border-[#2a3441] flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold flex items-center gap-2"><Truck size={16} className="text-amber-500" /> {crew.crew_id}</h3>
                  <span className={`text-xs px-2 py-1 rounded border ${crew.status === 'AVAILABLE' ? 'border-green-900/50 text-green-500 bg-green-950/30' : 'border-blue-900/50 text-blue-400 bg-blue-950/30'}`}>
                    {crew.status}
                  </span>
                </div>
                <div className="text-sm text-slate-300">
                  <div className="flex items-center gap-2 mb-1"><MapPin size={14} className="text-slate-500" /> Current Zone: <strong>{crew.current_zone}</strong></div>
                  <div className="mt-4 pt-3 border-t border-[#2a3441] text-xs text-slate-400 flex justify-between">
                    <span>Active Shift</span>
                    <span>Lat: {crew.base_latitude?.toFixed(4) || 'N/A'} / Lon: {crew.base_longitude?.toFixed(4) || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  </>
}
