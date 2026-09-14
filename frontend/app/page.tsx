'use client'

import Link from 'next/link'
import { Zap, Database, Cpu, Network, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-mesh-gradient flex flex-col items-center justify-center text-white relative overflow-hidden font-sans">
      
      {/* Decorative Grid Lines Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(42, 52, 65, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(42, 52, 65, 0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="z-10 text-center max-w-5xl px-6">
        
        {/* Brand Logo & Intro */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              <Zap size={28} className="text-black" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4" style={{ textShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            GRID<span className="text-amber-500">GUARD</span>
          </h1>
          
          <p className="text-xl md:text-3xl font-light text-slate-300 tracking-wide mb-10">
            Predict. Diagnose. Prioritize. Prevent.
          </p>
        </div>

        {/* CTA Button */}
        <div className="animate-fade-in-up mb-24" style={{ animationDelay: '0.3s' }}>
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-3 bg-amber-500 text-black px-10 py-5 rounded-full font-bold text-lg md:text-xl transition-all hover:bg-amber-400 hover:scale-105 animate-glow-pulse"
          >
            Launch Operations Platform <ArrowRight size={22} />
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          
          <div className="glass-card p-6 rounded-2xl text-left">
            <div className="w-10 h-10 bg-blue-900/40 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
              <Database size={18} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Synthetic Data Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Powered by a high-performance SQLite backend generating thousands of realistic, geographically distributed asset telemetry signals.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-left">
            <div className="w-10 h-10 bg-amber-900/40 rounded-full flex items-center justify-center mb-4 border border-amber-500/30">
              <Cpu size={18} className="text-amber-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">Predictive AI Analytics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Integrates Scikit-learn Logistic Regression and Isolation Forests to predict failure probabilities and detect multi-variate anomalies.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-left">
            <div className="w-10 h-10 bg-emerald-900/40 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
              <Network size={18} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Spatial Digital Twin</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Next.js and Recharts frontend delivering real-time operational visibility, interactive topology mapping, and field dispatch tracking.
            </p>
          </div>

        </div>

      </div>
      
      {/* Footer text */}
      <div className="absolute bottom-6 text-slate-500 text-xs font-mono tracking-widest z-10 animate-fade-in-up" style={{ animationDelay: '1s' }}>
        HACKATHON PROTOTYPE • v0.9.0 • LIVE DATA STREAM CONNECTED
      </div>
    </div>
  )
}
