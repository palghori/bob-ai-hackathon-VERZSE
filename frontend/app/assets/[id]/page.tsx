'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { 
  ArrowLeft, Thermometer, Activity, AlertTriangle, Gauge, ChevronRight, 
  MapPin, Zap, Wrench, ShieldCheck, Box
} from 'lucide-react'

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'red' | 'amber' | 'green' | 'blue' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export default function AssetProfile() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [asset, setAsset] = useState<any>(null)
  const [sensorData, setSensorData] = useState<any[]>([])
  const [range, setRange] = useState('24h')

  useEffect(() => {
    async function fetchAssetData() {
      try {
        const [assetRes, sensorRes] = await Promise.all([
          fetch(`http://localhost:4000/api/assets/${id}`).then(r => r.json()),
          fetch(`http://localhost:4000/api/sensors/${id}?range=${range}`).then(r => r.json())
        ])
        
        setAsset(assetRes.asset_id ? assetRes : assetRes.data)
        setSensorData(sensorRes.data || [])
      } catch (err) {
        console.error('Failed to fetch asset data', err)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchAssetData()
  }, [id, range])

  if (loading) return <div className="app-shell flex items-center justify-center h-screen"><div className="pulse-dot w-6 h-6" /></div>
  if (!asset) return <div className="app-shell flex items-center justify-center h-screen">Asset not found.</div>

  const isCritical = asset.health_status === 'CRITICAL' || asset.prediction?.risk_band === 'CRITICAL'
  const isWarning = asset.health_status === 'WARNING' || asset.prediction?.risk_band === 'HIGH'

  const latestSensor = sensorData.length > 0 ? sensorData[sensorData.length - 1] : null;

  return <>
    <main className="main-area" style={{ marginLeft: 0 }}>
      <header className="topbar px-6">
        <button className="icon-btn" onClick={() => router.push('/')} aria-label="Back to dashboard"><ArrowLeft size={20} /></button>
        <div className="top-status"><span><Box size={14} /> Asset Profile</span></div>
      </header>

      <div className="content">
        <div className="page-heading">
          <div>
            <div className="breadcrumb">OPERATIONS / ASSETS / <span>{id}</span></div>
            <h1>{asset.asset_name}</h1>
            <p><MapPin size={14} className="inline mr-1" /> {asset.region} · {asset.zone} · {asset.asset_type} ({asset.voltage_level})</p>
          </div>
          <div className="heading-actions">
            <Badge tone={isCritical ? 'red' : isWarning ? 'amber' : 'green'}>{asset.health_status || 'UNKNOWN'}</Badge>
            <button className="button primary"><Wrench size={15} /> Create Work Order</button>
          </div>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className={`kpi-icon ${isCritical ? 'red' : isWarning ? 'amber' : 'green'}`}><Activity size={17} /></div>
            <div className="kpi-label">HEALTH SCORE</div>
            <div className="kpi-value">{asset.health_score?.overall_score || 'N/A'}</div>
            <div className="kpi-sub">Out of 100</div>
          </div>
          <div className="kpi-card">
            <div className={`kpi-icon ${asset.prediction?.failure_probability > 0.5 ? 'red' : 'amber'}`}><AlertTriangle size={17} /></div>
            <div className="kpi-label">FAILURE PROBABILITY</div>
            <div className="kpi-value">{Math.round((asset.prediction?.failure_probability || 0) * 100)}%</div>
            <div className="kpi-sub">Next 30 days</div>
          </div>
          <div className="kpi-card">
            <div className={`kpi-icon ${asset.prediction?.anomaly_status === 'ANOMALOUS' ? 'red' : 'neutral'}`}><Gauge size={17} /></div>
            <div className="kpi-label">ANOMALY STATUS</div>
            <div className="kpi-value" style={{fontSize: '24px'}}>{asset.prediction?.anomaly_status || 'NORMAL'}</div>
            <div className="kpi-sub">Isolation Forest Model</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon blue"><Zap size={17} /></div>
            <div className="kpi-label">CUSTOMERS SERVED</div>
            <div className="kpi-value">{(asset.customers_served / 1000).toFixed(1)}k</div>
            <div className="kpi-sub">Downstream impact</div>
          </div>
        </div>

        <div className="dashboard-grid mt-6">
          <section className="panel">
            <div className="panel-head">
              <div>
                <div className="eyebrow">TELEMETRY</div>
                <h2>Condition Trend</h2>
              </div>
              <div className="range-tabs">
                {['1h', '6h', '24h', '7d'].map((r) => 
                  <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)}>{r}</button>
                )}
              </div>
            </div>
            <div style={{ height: 300, width: '100%', marginTop: '20px' }}>
              {sensorData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3441" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(tick) => new Date(tick).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                      stroke="#8892b0" 
                    />
                    <YAxis yAxisId="left" stroke="#8892b0" domain={['auto', 'auto']} />
                    <YAxis yAxisId="right" orientation="right" stroke="#8892b0" domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#112240', border: '1px solid #233554' }}
                      labelFormatter={(label) => new Date(label).toLocaleString()}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#ef4444" dot={false} strokeWidth={2} />
                    {asset.asset_type === 'Transformer' && <Line yAxisId="left" type="monotone" dataKey="hydrogen" name="H2 (ppm)" stroke="#eab308" dot={false} strokeWidth={2} />}
                    <Line yAxisId="right" type="monotone" dataKey="load_percent" name="Load (%)" stroke="#3b82f6" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">No sensor data available for this range.</div>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div>
                <div className="eyebrow">DIAGNOSTICS</div>
                <h2>Risk Factors & Contributors</h2>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase">Condition Engine Flags</h4>
                <ul className="space-y-2">
                  {asset.health_score?.contributors && JSON.parse(asset.health_score.contributors).map((flag: string, idx: number) => (
                    <li key={idx} className="flex items-start text-sm">
                      <AlertTriangle size={14} className="mt-0.5 mr-2 text-amber-500 shrink-0" />
                      <span>{flag}</span>
                    </li>
                  ))}
                  {(!asset.health_score?.contributors || JSON.parse(asset.health_score.contributors).length === 0) && (
                    <li className="text-sm text-slate-500 flex items-center"><ShieldCheck size={14} className="mr-2 text-green-500" /> All systems nominal</li>
                  )}
                </ul>
              </div>

              {asset.prediction?.top_features && (
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase">ML Top Risk Drivers</h4>
                  <ul className="space-y-2">
                    {JSON.parse(asset.prediction.top_features).map((feature: any, idx: number) => (
                      <li key={idx} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{feature.feature.replace('_', ' ')}</span>
                        <div className="flex items-center w-32">
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500" style={{ width: `${Math.min(100, feature.importance * 100)}%` }} />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        </div>

        {asset.asset_type === 'Transformer' && latestSensor && (
          <div className="dashboard-grid mt-6">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="eyebrow">DGA ANALYSIS</div>
                  <h2>Dissolved Gases</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="kpi-card !p-3">
                  <div className="text-xs text-slate-400">Hydrogen (H2)</div>
                  <div className={`text-xl font-bold ${latestSensor.hydrogen > 150 ? 'text-red-500' : ''}`}>{latestSensor.hydrogen} ppm</div>
                </div>
                <div className="kpi-card !p-3">
                  <div className="text-xs text-slate-400">Methane (CH4)</div>
                  <div className={`text-xl font-bold ${latestSensor.methane > 120 ? 'text-red-500' : ''}`}>{latestSensor.methane} ppm</div>
                </div>
                <div className="kpi-card !p-3">
                  <div className="text-xs text-slate-400">Acetylene (C2H2)</div>
                  <div className={`text-xl font-bold ${latestSensor.acetylene > 10 ? 'text-red-500' : ''}`}>{latestSensor.acetylene} ppm</div>
                </div>
                <div className="kpi-card !p-3">
                  <div className="text-xs text-slate-400">Ethylene (C2H4)</div>
                  <div className={`text-xl font-bold ${latestSensor.ethylene > 50 ? 'text-amber-500' : ''}`}>{latestSensor.ethylene} ppm</div>
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="eyebrow">BUSHING & TAP CHANGER</div>
                  <h2>Component Health</h2>
                </div>
              </div>
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center p-3 bg-[#16202b] rounded border border-[#2a3441]">
                  <div>
                    <div className="text-sm font-semibold">Bushing Tan Delta</div>
                    <div className="text-xs text-slate-400">Insulation degradation</div>
                  </div>
                  <div className={`text-lg font-bold ${latestSensor.bushing_tandelta > 0.5 ? 'text-amber-500' : 'text-green-500'}`}>
                    {latestSensor.bushing_tandelta}%
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#16202b] rounded border border-[#2a3441]">
                  <div>
                    <div className="text-sm font-semibold">Tap Changer Operations</div>
                    <div className="text-xs text-slate-400">Lifetime actuations</div>
                  </div>
                  <div className="text-lg font-bold">
                    {latestSensor.tap_changer_operations?.toLocaleString() || 'N/A'}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  </>
}
