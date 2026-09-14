'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, BarChart3, Bell, Bot, Box, Check, ChevronDown, ChevronRight,
  CircleGauge, CloudRain, Cpu, Database, Gauge, Grid3X3, HardHat, Info, Layers3,
  MapPin, Menu, Network, Plus, Search, Settings, ShieldCheck, SlidersHorizontal,
  Sparkles, Sun, Thermometer, TrendingDown, TrendingUp, Users, Wrench, X, Zap
} from 'lucide-react'
import Link from 'next/link'
import Topbar from '../components/Topbar'

type Asset = {
  asset_id: string;
  asset_name: string;
  asset_type: string;
  region: string;
  health_score: number;
  failure_probability: number;
  anomaly_status: string;
  criticality: string;
  health_status: string;
  risk_band: string;
  customers_served: number;
  maintenance_status: string;
  contributors: string;
}



function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'red' | 'amber' | 'green' | 'blue' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

function Panel({ title, eyebrow, children, action }: { title: string; eyebrow?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return <section className="panel"><div className="panel-head"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2></div>{action}</div>{children}</section>
}

export default function Page() {
  const [activeNav, setActiveNav] = useState('Command Center')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'probability' | 'health'>('probability')
  const [mobileNav, setMobileNav] = useState(false)
  const [showSimulation, setShowSimulation] = useState(false)
  const [scenario, setScenario] = useState('Current conditions')
  const [activeScenario, setActiveScenario] = useState('Current conditions')

  const [loading, setLoading] = useState(true)
  const [assets, setAssets] = useState<Asset[]>([])
  const [kpis, setKpis] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [acknowledged, setAcknowledged] = useState<string[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const [kpisRes, riskRes, alertsRes] = await Promise.all([
          fetch(`http://localhost:4000/api/dashboard/kpis`).then(r => r.json()),
          fetch(`http://localhost:4000/api/dashboard/fleet-risk`).then(r => r.json()),
          fetch(`http://localhost:4000/api/alerts`).then(r => r.json()),
        ]);
        
        setKpis(kpisRes.kpis);
        setAssets(riskRes.data || []);
        setAlerts(alertsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [])

  const filteredAssets = useMemo(() => {
    let filtered = assets.filter((asset) => 
      `${asset.asset_id} ${asset.asset_name} ${asset.region}`.toLowerCase().includes(query.toLowerCase())
    );

    // Apply active scenario effects
    if (activeScenario !== 'Current conditions') {
       filtered = filtered.map(a => {
         const multiplier = activeScenario === 'Heatwave + 48h' ? 1.5 : 1.3;
         const newProb = Math.min(1, (a.failure_probability || 0) * multiplier + 0.1);
         const newHealth = Math.max(0, (a.health_score || 100) - (activeScenario === 'Heatwave + 48h' ? 20 : 15));
         return {
           ...a,
           failure_probability: newProb,
           health_score: newHealth,
           risk_band: newProb > 0.7 ? 'CRITICAL' : newProb > 0.4 ? 'HIGH' : 'LOW'
         }
       })
    }

    return filtered.sort((a, b) => 
      sort === 'health' 
        ? (a.health_score || 0) - (b.health_score || 0) 
        : (b.failure_probability || 0) - (a.failure_probability || 0)
    );
  }, [assets, query, sort, activeScenario]);

  const scenarioDelta = scenario === 'Heatwave + 48h' ? 16 : scenario === 'Storm front' ? 11 : 0
  const appliedDelta = activeScenario === 'Heatwave + 48h' ? 16 : activeScenario === 'Storm front' ? 11 : 0

  if (loading) return <div className="flex items-center justify-center h-screen w-full"><div className="pulse-dot w-6 h-6" /></div>

  return <>
    <main className="main-area">
      <Topbar />

      <div className="content">
        <div className="page-heading"><div><div className="breadcrumb">OPERATIONS / <span>COMMAND CENTER</span></div><h1>Command Center</h1><p>Predict. Diagnose. Prioritize. Prevent.</p></div><div className="heading-actions"><Badge tone={activeScenario === 'Current conditions' ? 'green' : 'amber'}>{activeScenario === 'Current conditions' ? 'LIVE API DATA' : `SCENARIO: ${activeScenario.toUpperCase()}`}</Badge><button className="button primary" onClick={() => setShowSimulation(true)}><Sparkles size={15} /> Run simulation</button></div></div>

        {kpis && <div className="kpi-grid">
          {[['TOTAL ASSETS', kpis.total_assets, 'Across 8 regions', 'neutral', Box], 
            ['AT RISK', kpis.at_risk + appliedDelta, '+3 since yesterday', 'amber', AlertTriangle], 
            ['CRITICAL', kpis.critical + (appliedDelta ? 2 : 0), 'Requires action today', 'red', ShieldCheck], 
            ['OUTAGE EXPOSURE', ((kpis.outage_exposure + (appliedDelta * 1700)) / 1000).toFixed(1) + 'k', 'Customers impacted', 'red', Zap], 
            ['OPEN WORK ORDERS', kpis.open_work_orders, 'Pending actions', 'blue', Wrench], 
            ['CREWS AVAILABLE', kpis.crews_available, `of ${kpis.total_crews} active`, 'green', HardHat]]
            .map(([label, value, sub, tone, Icon]) => <div className="kpi-card" key={label as string}><div className={`kpi-icon ${tone}`}><Icon size={17} /></div><div className="kpi-label">{label as string}</div><div className="kpi-value">{value as string|number}</div><div className="kpi-sub">{sub as string}</div></div>)}
        </div>}

        <Panel title="Fleet risk ranking" eyebrow="PRIORITY QUEUE" action={<div className="panel-actions"><div className="search"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search assets" aria-label="Search assets" /></div><select value={sort} onChange={(e) => setSort(e.target.value as 'probability' | 'health')} aria-label="Sort assets"><option value="probability">Sort: Failure risk</option><option value="health">Sort: Health score</option></select></div>}>
          <div className="table-wrap"><table><thead><tr><th>ASSET</th><th>HEALTH</th><th>FAILURE PROB.</th><th>ANOMALY</th><th>OUTAGE RISK</th><th>IMPACT</th><th>ACTION</th></tr></thead><tbody>{filteredAssets.slice(0, 10).map((asset) => <tr key={asset.asset_id}><td><div className="asset-name"><span className={`risk-dot ${asset.risk_band === 'CRITICAL' ? 'critical' : asset.risk_band === 'HIGH' ? 'high' : 'low'}`} /> <div><strong>{asset.asset_id}</strong><span>{asset.asset_name}</span></div></div></td><td><div className="health-cell"><div className="health-bar"><i style={{ width: `${asset.health_score || 0}%` }} className={(asset.health_score || 0) < 40 ? 'red' : (asset.health_score || 0) < 65 ? 'amber' : 'green'} /></div><b>{asset.health_score || '?'}</b></div></td><td><strong className={(asset.failure_probability || 0) > 0.7 ? 'text-red' : (asset.failure_probability || 0) > 0.4 ? 'text-amber' : 'text-green'}>{Math.round((asset.failure_probability || 0) * 100)}%</strong></td><td>{asset.anomaly_status || 'Normal'}</td><td><strong>{asset.risk_band || 'LOW'}</strong></td><td>{(asset.customers_served / 1000).toFixed(1)}k</td><td><Link href={`/assets/${asset.asset_id}`} className="action-link">View profile <ChevronRight size={13} /></Link></td></tr>)}</tbody></table>{filteredAssets.length === 0 && <div className="empty">No matching assets found.</div>}</div>
        </Panel>

        <div className="dashboard-grid">
          <Panel title="Grid topology" eyebrow="2D FALLBACK VIEW" action={<Badge tone="neutral">3D twin unavailable</Badge>}>
            <div className="topology-legend"><span><i className="legend-dot green" /> Healthy</span><span><i className="legend-dot amber" /> At risk</span><span><i className="legend-dot red" /> Critical</span></div><div className="topology"><svg viewBox="0 0 540 290" role="img" aria-label="Synthetic grid topology"><path d="M52 222 L140 166 L232 212 L320 142 L430 198 L495 110 M140 166 L172 76 L320 142 M232 212 L260 266 L430 198 M320 142 L355 55 L495 110" fill="none" stroke="#334052" strokeWidth="2" /><path d="M52 222 L140 166 L232 212 L320 142 L430 198 L495 110" fill="none" stroke="#5a6879" strokeWidth="1" strokeDasharray="5 6" />{[[52,222,'green','North'],[140,166,'red','Valley'],[232,212,'amber','South'],[320,142,'amber','East'],[430,198,'green','Cedar'],[495,110,'green','West'],[172,76,'green','Ridge'],[260,266,'green','Lake'],[355,55,'green','Pine']].map(([x,y,t,label]) => <g key={label as string} className="topo-node"><circle cx={x as number} cy={y as number} r="10" fill="#16202b" stroke={`var(--${t})`} strokeWidth="2" /><circle cx={x as number} cy={y as number} r="4" fill={`var(--${t})`} /><text x={(x as number) + 14} y={(y as number) + 4}>{label as string}</text></g>)}</svg><div className="topology-note"><Network size={15} /> Topology rendering</div></div>
          </Panel>

          <Panel title="Alert center" eyebrow="REQUIRES ATTENTION">
            <div className="alerts">{alerts.filter(a => !acknowledged.includes(a.alert_id)).slice(0, 4).map((alert) => <div className="alert-row" key={alert.alert_id}><span className={`alert-icon ${alert.severity === 'CRITICAL' ? 'red' : alert.severity === 'WARNING' ? 'amber' : 'blue'}`}><AlertTriangle size={15} /></span><div><strong>{alert.title}</strong><span>{alert.asset_id} · {new Date(alert.timestamp).toLocaleTimeString()}</span></div><button className="ack" onClick={() => {
              setAcknowledged([...acknowledged, alert.alert_id])
              fetch(`http://localhost:4000/api/alerts/${alert.alert_id}/acknowledge`, { method: 'POST' })
              const savedRead = JSON.parse(localStorage.getItem('gridguard_read_notifs') || '[]')
              const nextRead = new Set([...savedRead, alert.alert_id])
              localStorage.setItem('gridguard_read_notifs', JSON.stringify(Array.from(nextRead)))
              window.dispatchEvent(new Event('gridguard_notifs_changed'))
            }}><Check size={14} /> Acknowledge</button></div>)}</div>
            {acknowledged.length > 0 && <div className="acknowledged"><Check size={14} /> {acknowledged.length} alert(s) acknowledged</div>}
          </Panel>
        </div>
      </div>
    </main>

    {showSimulation && <div className="modal-backdrop" onClick={() => setShowSimulation(false)}><div className="modal" onClick={(e) => e.stopPropagation()}><div className="modal-head"><div><div className="eyebrow">SIMULATION LAB · DEMO</div><h2>Run scenario analysis</h2></div><button className="icon-btn" onClick={() => setShowSimulation(false)}><X size={18} /></button></div><p className="modal-copy">Explore how synthetic conditions change fleet risk. Results are illustrative decision support only.</p><label className="field-label">Scenario<select value={scenario} onChange={(e) => setScenario(e.target.value)}><option>Current conditions</option><option>Heatwave + 48h</option><option>Storm front</option></select></label><div className="scenario-result"><div><span>At-risk assets</span><strong>{kpis?.at_risk || 0} <em>{scenarioDelta ? `+${scenarioDelta}` : 'baseline'}</em></strong></div><div><span>Outage exposure</span><strong>{(kpis?.outage_exposure || 0)/1000}k <em>{scenarioDelta ? `+${(scenarioDelta * 1.7).toFixed(1)}k` : 'baseline'}</em></strong></div><div><span>Critical assets</span><strong>{kpis?.critical || 0} <em>{scenarioDelta ? '+2' : 'baseline'}</em></strong></div></div><div className="modal-actions"><button className="button" onClick={() => setShowSimulation(false)}>Cancel</button><button className="button primary" onClick={() => { setActiveScenario(scenario); setShowSimulation(false); }}><Sparkles size={15} /> Apply scenario</button></div></div></div>}
  </>
}
