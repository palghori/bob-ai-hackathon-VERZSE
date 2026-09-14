'use client'

import Topbar from '../components/Topbar'
import { Lock, ShieldAlert } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function ModuleLockedPage({ params }: { params: { module: string } }) {
  const pathname = usePathname()
  
  // Format the module name nicely
  const rawModule = pathname.replace('/', '')
  const moduleName = rawModule
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return <>
    <main className="main-area">
      <Topbar />

      <div className="content flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="max-w-md w-full text-center p-8 bg-[#16202b] rounded-xl border border-[#2a3441] shadow-2xl relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/20 blur-[50px] rounded-full pointer-events-none" />
          
          <div className="w-16 h-16 bg-[#0d141c] border border-[#2a3441] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner relative z-10">
            <Lock size={28} className="text-amber-500" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2 tracking-tight">Premium Module Locked</h1>
          <p className="text-slate-400 mb-8 text-sm">
            The <strong>{moduleName || 'Requested'}</strong> module requires a GridGuard Enterprise License or an active live SCADA connection to activate.
          </p>
          
          <div className="bg-[#0d141c] rounded-lg p-4 border border-[#1e2936] text-left">
            <h3 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-wider">
              <ShieldAlert size={14} /> License Status
            </h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300">Current Plan</span>
              <span className="px-2 py-0.5 bg-blue-950/40 text-blue-400 border border-blue-900/40 rounded text-xs font-bold">PROTOTYPE</span>
            </div>
          </div>
          
          <button 
            className="w-full mt-6 button primary !justify-center !py-3"
            onClick={() => alert("System Message: In a production environment, this would open a lead capture form or email the sales team. (Prototype Mode)")}
          >
            Contact Sales to Upgrade
          </button>
        </div>
      </div>
    </main>
  </>
}
