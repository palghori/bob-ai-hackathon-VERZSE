'use client'

import { useState } from 'react'
import Topbar from '../components/Topbar'
import {
  AlertTriangle, Calendar, CheckCircle2, ChevronRight, Clock,
  Cpu, Droplet, FileText, HardHat, Info,
  PackageOpen, Play, Search, ShieldCheck, Thermometer,
  Wrench, Zap, Bot, X
} from 'lucide-react'

// Badge component from dashboard (reused style pattern)
function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'red' | 'amber' | 'green' | 'blue' | 'purple' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

function Panel({ title, eyebrow, children, action, className = '' }: { title: string; eyebrow?: string; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-head">
        <div>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h2>{title}</h2>
        </div>
        {action && <div className="panel-actions">{action}</div>}
      </div>
      {children}
    </section>
  )
}

const predictiveQueue = [
  { id: 'TX-1001', name: 'Westgate Transformer 1', health: 54, window: '12-48 hrs', rec: 'Replace primary cooling fan', cost: '$2,400' },
  { id: 'CB-4092', name: 'Valley Sub. Breaker', health: 62, window: '3-5 days', rec: 'Contact wear inspection', cost: '$800' },
  { id: 'SA-210', name: 'Pine Hills Solar Inverter', health: 68, window: '7-10 days', rec: 'Thermal imaging & cleaning', cost: '$1,200' },
]

const schedule = [
  { date: 'Today', tasks: [
    { id: 'WO-8821', asset: 'TX-1026', type: 'Preventative', status: 'In Progress', crew: 'Team Alpha' }
  ]},
  { date: 'Tomorrow', tasks: [
    { id: 'WO-8822', asset: 'SS-Valley', type: 'Inspection', status: 'Scheduled', crew: 'Team Beta' },
    { id: 'WO-8823', asset: 'LN-North-4', type: 'Tree Trimming', status: 'Scheduled', crew: 'Team Gamma' }
  ]},
]

const inventory = [
  { item: '50kVA Transformers', current: 12, min: 15, status: 'warning' },
  { item: 'Cooling Fans (Type A)', current: 45, min: 20, status: 'ok' },
  { item: 'Circuit Breakers (15kV)', current: 8, min: 10, status: 'warning' },
  { item: 'Smart Meters', current: 1200, min: 500, status: 'ok' },
]

const logs = [
  { id: 'LOG-992', date: 'Oct 12, 2026', asset: 'TX-1040', action: 'Oil flush and refill', crew: 'Team Alpha', status: 'Completed' },
  { id: 'LOG-991', date: 'Oct 10, 2026', asset: 'SA-205', action: 'Inverter replacement', crew: 'Team Delta', status: 'Completed' },
  { id: 'LOG-990', date: 'Oct 09, 2026', asset: 'SS-Ridge', action: 'Routine relay test', crew: 'Team Beta', status: 'Completed' },
  { id: 'LOG-989', date: 'Oct 05, 2026', asset: 'CB-4011', action: 'Contact replacement', crew: 'Team Alpha', status: 'Completed' },
]

export default function MaintenancePage() {
  const [simAsset, setSimAsset] = useState('TX-1001')
  const [simRunning, setSimRunning] = useState(false)
  const [simResult, setSimResult] = useState<any>(null)
  
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)

  const runSimulation = () => {
    setSimRunning(true)
    setSimResult(null)
    setTimeout(() => {
      setSimRunning(false)
      if (simAsset === 'TX-1001') {
        setSimResult({ downtime: '4h 30m', customers: '23.4k', risk: 'Medium', cost: '$4,200', reroute: 'Available via Substation B' })
      } else {
        setSimResult({ downtime: '2h 15m', customers: '8.2k', risk: 'Low', cost: '$1,800', reroute: 'Available via Valley Circuit 2' })
      }
    }, 1200)
  }

  return (
    <>
      <main className="main-area">
      <Topbar />

      <div className="content">
        <div className="page-heading">
          <div>
            <div className="breadcrumb">OPERATIONS / <span>MAINTENANCE</span></div>
            <h1>Maintenance & Upkeep</h1>
            <p>Predictive scheduling, inventory, and lifecycle management.</p>
          </div>
          <div className="heading-actions">
            <Badge tone="purple"><Bot size={13} className="mr-1 inline" /> ML Predictions Active</Badge>
          </div>
        </div>

        <div className="dashboard-grid maintenance-layout">
          
          {/* Predictive Queue */}
          <Panel title="Predictive Maintenance Queue" eyebrow="AI RECOMMENDED" className="col-span-2">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ASSET</th>
                    <th>HEALTH</th>
                    <th>PREDICTED FAILURE</th>
                    <th>AI RECOMMENDATION</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {predictiveQueue.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="asset-name">
                          <span className="risk-dot critical" />
                          <div>
                            <strong>{item.id}</strong>
                            <span>{item.name}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="health-cell">
                          <div className="health-bar"><i style={{ width: `${item.health}%` }} className="amber" /></div>
                          <b>{item.health}</b>
                        </div>
                      </td>
                      <td><span className="text-red font-semibold"><Clock size={13} className="inline mr-1 mb-0.5" />{item.window}</span></td>
                      <td className="text-slate-300">{item.rec}</td>
                      <td><button className="button primary px-3 py-1.5 text-xs">Schedule</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Simulator */}
          <Panel title="Planned Outage Simulator" eyebrow="IMPACT ANALYSIS">
            <div className="flex flex-col space-y-4 h-full">
              <p className="text-sm text-slate-400">Simulate grid impact for scheduled asset downtime before approving work orders.</p>
              
              <div className="field-group flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Asset</label>
                <select 
                  className="bg-[#0b1118] border border-[#2a3441] text-sm text-white rounded p-2 outline-none focus:border-blue-500 transition-colors"
                  value={simAsset} onChange={(e) => setSimAsset(e.target.value)}
                >
                  <option value="TX-1001">TX-1001 (Westgate Transformer 1)</option>
                  <option value="CB-4092">CB-4092 (Valley Sub. Breaker)</option>
                  <option value="SA-210">SA-210 (Pine Hills Solar Inverter)</option>
                </select>
              </div>

              <button 
                className="button primary w-full justify-center" 
                onClick={runSimulation}
                disabled={simRunning}
              >
                {simRunning ? <div className="pulse-dot w-4 h-4 mr-2" /> : <Play size={15} className="mr-2" />}
                {simRunning ? 'Simulating impact...' : 'Run Simulation'}
              </button>

              {simResult && (
                <div className="mt-4 p-4 rounded bg-[#16202b] border border-[#2a3441] text-sm animate-fade-in">
                  <h4 className="font-semibold text-white mb-3 flex items-center"><CheckCircle2 size={15} className="text-green-500 mr-2" /> Simulation Complete</h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Est. Downtime</div>
                      <div className="font-medium text-white">{simResult.downtime}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Customers Affected</div>
                      <div className="font-medium text-amber-500">{simResult.customers}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Grid Risk Shift</div>
                      <div className="font-medium text-white">{simResult.risk}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Est. Maintenance Cost</div>
                      <div className="font-medium text-white">{simResult.cost}</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#2a3441]">
                    <div className="text-xs text-slate-500 mb-0.5">Rerouting Plan</div>
                    <div className="font-medium text-blue-400">{simResult.reroute}</div>
                  </div>
                </div>
              )}
            </div>
          </Panel>

          {/* Schedule */}
          <Panel title="Maintenance Schedule" eyebrow="UPCOMING" className="col-span-1">
            <div className="flex flex-col space-y-6">
              {schedule.map((day) => (
                <div key={day.date}>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{day.date}</h3>
                  <div className="flex flex-col space-y-2.5">
                    {day.tasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded bg-[#0b1118] border border-[#2a3441]">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded flex items-center justify-center mr-3 ${task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-[#1e293b] text-slate-400'}`}>
                            {task.status === 'In Progress' ? <Wrench size={14} /> : <Calendar size={14} />}
                          </div>
                          <div>
                            <div className="font-medium text-sm text-white">{task.asset} <span className="text-slate-500 mx-1">·</span> {task.type}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{task.id} — Assigned to {task.crew}</div>
                          </div>
                        </div>
                        <Badge tone={task.status === 'In Progress' ? 'blue' : 'neutral'}>{task.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Inventory */}
          <Panel title="Critical Inventory" eyebrow="SPARE PARTS">
            <div className="flex flex-col space-y-4">
              {inventory.map(item => {
                const percent = Math.min(100, (item.current / (item.min * 1.5)) * 100)
                return (
                  <div key={item.item}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-300 font-medium">{item.item}</span>
                      <span className={item.status === 'warning' ? 'text-amber-500 font-bold' : 'text-slate-400'}>
                        {item.current} <span className="text-slate-500 font-normal">/ {item.min} min</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0b1118] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${item.status === 'warning' ? 'bg-amber-500' : 'bg-green-500'}`} 
                        style={{ width: `${percent}%` }} 
                      />
                    </div>
                  </div>
                )
              })}
              <button className="button w-full justify-center mt-2 text-xs" onClick={() => setShowInventoryModal(true)}>
                <PackageOpen size={14} className="mr-2" /> View Full Inventory
              </button>
            </div>
          </Panel>

          {/* Logs */}
          <Panel title="Historical Logs" eyebrow="ACTIVITY" className="col-span-1">
             <div className="flex flex-col space-y-0 relative">
               {/* Timeline line */}
               <div className="absolute left-4 top-2 bottom-2 w-px bg-[#2a3441] z-0"></div>
               
               {logs.map((log, i) => (
                 <div key={log.id} className="relative z-10 flex items-start py-3 pl-10 pr-2 hover:bg-[#0b1118]/50 rounded transition-colors group cursor-pointer">
                   <div className="absolute left-2.5 top-4 w-3 h-3 rounded-full bg-[#070b10] border-2 border-slate-600 group-hover:border-blue-400 transition-colors"></div>
                   <div className="flex-1">
                     <div className="flex justify-between items-baseline mb-0.5">
                       <strong className="text-sm text-white font-medium">{log.action}</strong>
                       <span className="text-xs text-slate-500">{log.date}</span>
                     </div>
                     <div className="text-xs text-slate-400">
                       <span className="text-blue-400">{log.asset}</span> by {log.crew}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
             <button className="button w-full justify-center mt-4 text-xs" onClick={() => setShowLogsModal(true)}>
               <FileText size={14} className="mr-2" /> View All Logs
             </button>
          </Panel>

        </div>
      </div>
    </main>

    {/* Full Inventory Modal */}
    {showInventoryModal && (
      <div className="modal-backdrop" onClick={() => setShowInventoryModal(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <div className="eyebrow">SPARE PARTS</div>
              <h2>Full Inventory Ledger</h2>
            </div>
            <button className="icon-btn" onClick={() => setShowInventoryModal(false)}><X size={18} /></button>
          </div>
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ITEM NAME</th>
                    <th>STOCK</th>
                    <th>MIN REQUIRED</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {[...inventory, 
                    { item: 'Voltage Regulators', current: 5, min: 10, status: 'warning' },
                    { item: 'Distribution Poles', current: 230, min: 100, status: 'ok' },
                    { item: 'Relay Modules', current: 34, min: 30, status: 'ok' },
                    { item: 'Industrial Batteries', current: 2, min: 15, status: 'warning' }
                  ].map((item, i) => (
                    <tr key={i}>
                      <td><strong className="text-white text-xs">{item.item}</strong></td>
                      <td>{item.current}</td>
                      <td>{item.min}</td>
                      <td><Badge tone={item.status === 'warning' ? 'amber' : 'green'}>{item.status === 'warning' ? 'Low Stock' : 'Adequate'}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* All Logs Modal */}
    {showLogsModal && (
      <div className="modal-backdrop" onClick={() => setShowLogsModal(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <div className="eyebrow">ACTIVITY</div>
              <h2>Historical Maintenance Logs</h2>
            </div>
            <button className="icon-btn" onClick={() => setShowLogsModal(false)}><X size={18} /></button>
          </div>
          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="flex flex-col space-y-0 relative">
               <div className="absolute left-4 top-2 bottom-2 w-px bg-[#2a3441] z-0"></div>
               {[...logs, 
                 { id: 'LOG-988', date: 'Oct 02, 2026', asset: 'TX-1001', action: 'Fan lubrication', crew: 'Team Charlie', status: 'Completed' },
                 { id: 'LOG-987', date: 'Sep 28, 2026', asset: 'SS-Valley', action: 'Quarterly inspection', crew: 'Team Alpha', status: 'Completed' },
                 { id: 'LOG-986', date: 'Sep 25, 2026', asset: 'LN-South-2', action: 'Fallen tree removal', crew: 'Team Delta', status: 'Completed' },
                 { id: 'LOG-985', date: 'Sep 20, 2026', asset: 'CB-4092', action: 'Firmware update', crew: 'Team Beta', status: 'Completed' },
               ].map((log, i) => (
                 <div key={log.id} className="relative z-10 flex items-start py-3 pl-10 pr-2 hover:bg-[#0b1118]/50 rounded transition-colors group cursor-pointer">
                   <div className="absolute left-2.5 top-4 w-3 h-3 rounded-full bg-[#070b10] border-2 border-slate-600 group-hover:border-blue-400 transition-colors"></div>
                   <div className="flex-1">
                     <div className="flex justify-between items-baseline mb-0.5">
                       <strong className="text-sm text-white font-medium">{log.action}</strong>
                       <span className="text-xs text-slate-500">{log.date}</span>
                     </div>
                     <div className="text-xs text-slate-400">
                       <span className="text-blue-400">{log.asset}</span> by {log.crew} <span className="ml-2 text-slate-500">[{log.id}]</span>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
