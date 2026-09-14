'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Topbar from '../components/Topbar'
import { Box, Search, ChevronRight, Menu, Bell, Database, Filter, Layers, LayoutGrid, List, SlidersHorizontal } from 'lucide-react'

export default function AssetsPage() {
  const [loading, setLoading] = useState(true)
  const [assets, setAssets] = useState<any[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:4000/api/dashboard/fleet-risk`).then(r => r.json())
        setAssets(res.data || [])
      } catch (err) {
        console.error('Error fetching assets', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredAssets = assets.filter((asset) => 
    `${asset.asset_id} ${asset.asset_name} ${asset.region}`.toLowerCase().includes(query.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center h-screen w-full"><div className="pulse-dot w-6 h-6" /></div>

  return <>
    <main className="main-area">
      <Topbar />

      <div className="content">
        <div className="page-heading">
          <div>
            <div className="breadcrumb">OPERATIONS / <span>ASSET INVENTORY</span></div>
            <h1>Transformer Fleet</h1>
            <p>Complete registry of all monitored grid assets.</p>
          </div>
        </div>

        <section className="panel mt-6">
          <div className="panel-head">
            <div>
              <div className="eyebrow">ALL ASSETS</div>
              <h2>{filteredAssets.length} Assets Found</h2>
            </div>
            <div className="panel-actions">
              <div className="search">
                <Search size={15} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ID, name, or region" />
              </div>
            </div>
          </div>
          <div className="table-wrap mt-4" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
            <table>
              <thead style={{ position: 'sticky', top: 0, background: '#111a24', zIndex: 1 }}>
                <tr>
                  <th>ASSET</th>
                  <th>REGION</th>
                  <th>TYPE & MVA</th>
                  <th>HEALTH</th>
                  <th>RISK BAND</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset.asset_id}>
                    <td>
                      <div className="asset-name">
                        <span className={`risk-dot ${asset.risk_band === 'CRITICAL' ? 'critical' : asset.risk_band === 'HIGH' ? 'high' : 'low'}`} /> 
                        <div><strong>{asset.asset_id}</strong><span>{asset.asset_name}</span></div>
                      </div>
                    </td>
                    <td>{asset.region} / {asset.zone}</td>
                    <td>{asset.asset_type} <span className="text-slate-400 text-xs ml-1">({asset.rated_power_mva} MVA)</span></td>
                    <td>
                      <div className="health-cell">
                        <div className="health-bar"><i style={{ width: `${asset.health_score || 0}%` }} className={(asset.health_score || 0) < 40 ? 'red' : (asset.health_score || 0) < 65 ? 'amber' : 'green'} /></div>
                        <b>{asset.health_score || '?'}</b>
                      </div>
                    </td>
                    <td><strong>{asset.risk_band || 'LOW'}</strong></td>
                    <td><Link href={`/assets/${asset.asset_id}`} className="action-link">Profile <ChevronRight size={13} /></Link></td>
                  </tr>
                ))}
                {filteredAssets.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-slate-400 py-8">No matching assets found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  </>
}
