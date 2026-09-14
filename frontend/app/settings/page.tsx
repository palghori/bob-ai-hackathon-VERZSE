'use client'

import { useState } from 'react'
import Topbar from '../components/Topbar'
import { Settings, Building, Key, BrainCircuit, Users, Trash2, Mail, Copy, Check, Info, Shield, Webhook } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('organization')
  const [copied, setCopied] = useState(false)

  // Dummy State for Toggles
  const [config, setConfig] = useState({
    autoDispatch: true,
    slackIntegration: true,
    pagerDuty: false,
    strictRBAC: true,
    anomalyDetection: true
  })

  const toggleConfig = (key: keyof typeof config) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="main-area">
      <Topbar />

      <div className="content">
        <div className="page-heading">
          <div>
            <div className="breadcrumb">OPERATIONS / <span>SYSTEM SETTINGS</span></div>
            <h1>Platform Configuration</h1>
            <p>Manage workspace settings, ML engine parameters, integrations, and RBAC.</p>
          </div>
        </div>

        <div className="profile-layout mt-6">
          {/* Vertical Tabs Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-tabs flex flex-col gap-1">
              <button 
                className={`profile-tab text-left px-4 py-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'organization' ? 'bg-[#3b82f6]/10 text-[#3b82f6] font-semibold border-l-2 border-[#3b82f6]' : 'text-slate-400 hover:bg-[#16202b]'}`} 
                onClick={() => setActiveTab('organization')}
              >
                <Building size={18} /> General & Organization
              </button>
              
              <button 
                className={`profile-tab text-left px-4 py-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'integrations' ? 'bg-[#3b82f6]/10 text-[#3b82f6] font-semibold border-l-2 border-[#3b82f6]' : 'text-slate-400 hover:bg-[#16202b]'}`} 
                onClick={() => setActiveTab('integrations')}
              >
                <Webhook size={18} /> Integrations & API
              </button>
              
              <button 
                className={`profile-tab text-left px-4 py-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'ml-engine' ? 'bg-[#3b82f6]/10 text-[#3b82f6] font-semibold border-l-2 border-[#3b82f6]' : 'text-slate-400 hover:bg-[#16202b]'}`} 
                onClick={() => setActiveTab('ml-engine')}
              >
                <BrainCircuit size={18} /> ML Engine Config
              </button>

              <button 
                className={`profile-tab text-left px-4 py-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'team' ? 'bg-[#3b82f6]/10 text-[#3b82f6] font-semibold border-l-2 border-[#3b82f6]' : 'text-slate-400 hover:bg-[#16202b]'}`} 
                onClick={() => setActiveTab('team')}
              >
                <Users size={18} /> Team & Roles
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="profile-content bg-[#16202b] rounded-lg border border-[#2a3441] p-6 lg:p-8">
            
            {/* TAB: ORGANIZATION */}
            {activeTab === 'organization' && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <h2 className="text-xl font-bold mb-1">Workspace Details</h2>
                  <p className="text-slate-400 text-sm mb-5">Update your organization's core configuration and identity.</p>
                  
                  <div className="space-y-4 max-w-xl">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-1">Workspace Name</label>
                      <input type="text" defaultValue="GRIDGUARD Global" className="w-full bg-[#0f172a] border border-[#2a3441] rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-1">System Timezone</label>
                      <select className="w-full bg-[#0f172a] border border-[#2a3441] rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 appearance-none">
                        <option>UTC (Coordinated Universal Time)</option>
                        <option>EST (Eastern Standard Time)</option>
                        <option>PST (Pacific Standard Time)</option>
                      </select>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-medium transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>

                <hr className="border-[#2a3441]" />

                <div>
                  <h2 className="text-xl font-bold text-red-500 mb-1">Danger Zone</h2>
                  <p className="text-slate-400 text-sm mb-5">Irreversible and destructive actions for this workspace.</p>
                  
                  <div className="border border-red-500/30 rounded-lg p-5 bg-red-500/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">Purge System Logs</h4>
                      <p className="text-sm text-slate-400">Permanently delete all incident and telemetry logs older than 90 days.</p>
                    </div>
                    <button className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500 px-4 py-2 rounded transition-colors font-medium">
                      Purge Logs
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: INTEGRATIONS */}
            {activeTab === 'integrations' && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <h2 className="text-xl font-bold mb-1">API Tokens</h2>
                  <p className="text-slate-400 text-sm mb-5">Manage tokens for programmatic access to the GRIDGUARD API.</p>
                  
                  <div className="bg-[#0f172a] border border-[#2a3441] rounded p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">Production Key</span>
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Active</span>
                      </div>
                      <code className="text-slate-400 text-sm tracking-widest">sk_live_98aF...x7pL</code>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleCopy} className="text-slate-400 hover:text-white p-2 bg-[#16202b] rounded transition-colors border border-[#2a3441]">
                        {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                      </button>
                      <button className="text-slate-400 hover:text-red-400 p-2 bg-[#16202b] rounded transition-colors border border-[#2a3441]">
                        Revoke
                      </button>
                    </div>
                  </div>
                  <button className="mt-4 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">+ Generate New Key</button>
                </div>

                <hr className="border-[#2a3441]" />

                <div>
                  <h2 className="text-xl font-bold mb-1">Third-Party Apps</h2>
                  <p className="text-slate-400 text-sm mb-5">Connect external services for alerting and incident response.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-[#0f172a] border border-[#2a3441] p-4 rounded">
                      <div>
                        <h4 className="font-semibold">Slack</h4>
                        <p className="text-sm text-slate-400">Send critical alerts to #grid-ops</p>
                      </div>
                      <div className="setting-toggle">
                        <input type="checkbox" id="slackIntegration" checked={config.slackIntegration} onChange={() => toggleConfig('slackIntegration')} />
                        <label htmlFor="slackIntegration"></label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-[#0f172a] border border-[#2a3441] p-4 rounded">
                      <div>
                        <h4 className="font-semibold">PagerDuty</h4>
                        <p className="text-sm text-slate-400">Trigger on-call escalation policies</p>
                      </div>
                      <div className="setting-toggle">
                        <input type="checkbox" id="pagerDuty" checked={config.pagerDuty} onChange={() => toggleConfig('pagerDuty')} />
                        <label htmlFor="pagerDuty"></label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ML ENGINE */}
            {activeTab === 'ml-engine' && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold">Predictive Risk Engine</h2>
                    <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded font-bold uppercase">v2.4.1</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-5">Tune the sensitivity and autonomous actions of the ML models.</p>
                  
                  <div className="space-y-6 max-w-xl">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-semibold text-slate-300">Failure Probability Alert Threshold</label>
                        <span className="text-blue-400 font-bold">75%</span>
                      </div>
                      <input type="range" min="0" max="100" defaultValue="75" className="w-full h-2 bg-[#0f172a] rounded-lg appearance-none cursor-pointer accent-blue-500" />
                      <p className="text-xs text-slate-500 mt-2">Assets with a failure probability exceeding this threshold will trigger critical alerts.</p>
                    </div>

                    <div className="flex items-center justify-between bg-[#0f172a] border border-[#2a3441] p-4 rounded">
                      <div>
                        <h4 className="font-semibold text-emerald-400">Autonomous Work Order Dispatch</h4>
                        <p className="text-sm text-slate-400">Automatically dispatch field crews when failure probability exceeds 90%.</p>
                      </div>
                      <div className="setting-toggle">
                        <input type="checkbox" id="autoDispatch" checked={config.autoDispatch} onChange={() => toggleConfig('autoDispatch')} />
                        <label htmlFor="autoDispatch"></label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-[#0f172a] border border-[#2a3441] p-4 rounded">
                      <div>
                        <h4 className="font-semibold">Real-time Anomaly Detection</h4>
                        <p className="text-sm text-slate-400">Run continuous inference on incoming sensor telemetry.</p>
                      </div>
                      <div className="setting-toggle">
                        <input type="checkbox" id="anomalyDetection" checked={config.anomalyDetection} onChange={() => toggleConfig('anomalyDetection')} />
                        <label htmlFor="anomalyDetection"></label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: TEAM & ROLES */}
            {activeTab === 'team' && (
              <div className="animate-fade-in space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Access Management</h2>
                    <p className="text-slate-400 text-sm">Manage team members and their operational permissions.</p>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors text-sm">
                    + Invite Member
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#2a3441] text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 px-2">Member</th>
                        <th className="pb-3 px-2">Role</th>
                        <th className="pb-3 px-2">Status</th>
                        <th className="pb-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-[#2a3441]">
                      <tr>
                        <td className="py-4 px-2">
                          <div className="font-semibold text-white">Pal Ghori</div>
                          <div className="text-slate-400 text-xs">pal.ghori@gridguard.ops</div>
                        </td>
                        <td className="py-4 px-2">
                          <span className="flex items-center gap-1 text-blue-400"><Shield size={14}/> Super Admin</span>
                        </td>
                        <td className="py-4 px-2">
                          <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-xs font-medium">Active</span>
                        </td>
                        <td className="py-4 px-2 text-right text-slate-500">Edit</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-2">
                          <div className="font-semibold text-white">Sarah Jenkins</div>
                          <div className="text-slate-400 text-xs">sarah.j@gridguard.ops</div>
                        </td>
                        <td className="py-4 px-2">Dispatcher</td>
                        <td className="py-4 px-2">
                          <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-xs font-medium">Active</span>
                        </td>
                        <td className="py-4 px-2 text-right text-slate-400 hover:text-white cursor-pointer transition-colors">Edit</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-2">
                          <div className="font-semibold text-white">Michael Chen</div>
                          <div className="text-slate-400 text-xs">m.chen@gridguard.ops</div>
                        </td>
                        <td className="py-4 px-2">Field Engineer</td>
                        <td className="py-4 px-2">
                          <span className="bg-slate-500/10 text-slate-400 px-2 py-1 rounded text-xs font-medium">Invited</span>
                        </td>
                        <td className="py-4 px-2 text-right text-slate-400 hover:text-white cursor-pointer transition-colors">Edit</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  )
}
