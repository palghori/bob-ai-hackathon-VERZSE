'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Activity, AlertTriangle, BarChart3, Bell, Bot, Box, Check, ChevronDown, ChevronRight,
  CloudRain, Cpu, Database, Gauge, Network, Settings, SlidersHorizontal, Users, Wrench, X, Zap, Maximize2
} from 'lucide-react'


import { Layers3 } from 'lucide-react';

export default function GridTwin() {
  const [activeNav, setActiveNav] = useState('Grid')
  const [mobileNav, setMobileNav] = useState(false)

  return <>
    <main className="main-area" style={{ position: 'relative', padding: 0, backgroundColor: '#070b10' }}>
      <header className="topbar px-6" style={{ background: 'rgba(11, 17, 24, 0.8)', backdropFilter: 'blur(10px)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottom: '1px solid rgba(42, 52, 65, 0.5)' }}>
        <button className="icon-btn menu-btn" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Network size={20} /></button>
        <div className="top-status"><span><Network size={14} /> 3D Digital Twin</span></div>
      </header>

      <div className="relative w-full h-full bg-[#070b10] overflow-hidden">
        <div className="w-full h-full overflow-auto">
          <div className="relative min-w-[1200px] min-h-[800px] w-full h-full flex items-center justify-center">
            {/* Abstract 3D Grid Mock representation */}
            <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '50px 50px', transform: 'perspective(1000px) rotateX(60deg) scale(2.5)', transformOrigin: 'top center' }} />
            
            <svg className="absolute z-10 w-full h-full" viewBox="0 0 1100 600" preserveAspectRatio="xMidYMid slice" style={{ overflow: 'visible' }}>
          <defs>
            <radialGradient id="glowRed" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(239,68,68,0.5)" />
              <stop offset="100%" stopColor="rgba(239,68,68,0)" />
            </radialGradient>
            <radialGradient id="glowAmber" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(245,158,11,0.5)" />
              <stop offset="100%" stopColor="rgba(245,158,11,0)" />
            </radialGradient>
            <radialGradient id="glowGreen" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(34,197,94,0.3)" />
              <stop offset="100%" stopColor="rgba(34,197,94,0)" />
            </radialGradient>
          </defs>

          {/* Lines */}
          <path d="M200 400 L400 300 L600 350 L800 200 L900 450 M400 300 L450 150 L600 350 M600 350 L700 500 L900 450" fill="none" stroke="#2a3441" strokeWidth="3" />
          <path d="M450 150 L800 200" fill="none" stroke="#2a3441" strokeWidth="2" strokeDasharray="5 5" />

          {/* Nodes */}
          {[
            [200, 400, 'green', 'Substation A', 'substation'],
            [400, 300, 'red', 'TX-1001 (Critical)', 'transformer'],
            [600, 350, 'amber', 'TX-1021 (At Risk)', 'transformer'],
            [800, 200, 'green', 'Substation B', 'substation'],
            [900, 450, 'green', 'Solar Array 1', 'solar'],
            [450, 150, 'green', 'Wind Farm Alpha', 'wind'],
            [700, 500, 'green', 'Industrial Zone', 'industrial']
          ].map(([x, y, type, label, category], idx) => {
            const statusColor = `var(--${type})`
            const glowId = `url(#glow${type === 'red' ? 'Red' : type === 'amber' ? 'Amber' : 'Green'})`
            
            return (
              <g key={idx} transform={`translate(${x}, ${y})`}>
                {/* Status Glow (Background) */}
                <circle cx="0" cy="0" r="45" fill={glowId} />
                
                {/* 3D Structure */}
                {category === 'substation' && (
                  <g>
                    {/* Base */}
                    <polygon points="-25,0 0,12 25,0 0,-12" fill="#1e293b" />
                    {/* Walls */}
                    <polygon points="-15,-5 0,2 15,-5 15,-15 0,-8 -15,-15" fill="#334155" />
                    <polygon points="-15,-5 0,2 0,-8 -15,-15" fill="#1e293b" />
                    {/* Roof */}
                    <polygon points="-15,-15 0,-8 15,-15 0,-22" fill="#475569" />
                    {/* Details */}
                    <circle cx="0" cy="-15" r="2" fill={statusColor} />
                    <line x1="-10" y1="-18" x2="-10" y2="-25" stroke="#94a3b8" strokeWidth="1" />
                    <line x1="10" y1="-12" x2="10" y2="-20" stroke="#94a3b8" strokeWidth="1" />
                  </g>
                )}

                {category === 'transformer' && (
                  <g>
                    <polygon points="-15,0 0,8 15,0 0,-8" fill="#1e293b" />
                    <polygon points="-10,-3 0,2 10,-3 10,-24 0,-19 -10,-24" fill="#3b4b5a" />
                    <polygon points="-10,-3 0,2 0,-19 -10,-24" fill="#273543" />
                    <polygon points="-10,-24 0,-19 10,-24 0,-29" fill="#4d6174" />
                    {/* Cooling Fins */}
                    <line x1="-8" y1="-5" x2="-8" y2="-20" stroke="#1e293b" strokeWidth="1" />
                    <line x1="-4" y1="-3" x2="-4" y2="-18" stroke="#1e293b" strokeWidth="1" />
                    <line x1="-0" y1="-1" x2="-0" y2="-16" stroke="#1e293b" strokeWidth="1" />
                    {/* Insulators */}
                    <polygon points="-5,-24 -3,-23 -3,-30 -5,-31" fill="#94a3b8" />
                    <polygon points="5,-24 7,-25 7,-32 5,-31" fill="#94a3b8" />
                    {/* Status Indicator */}
                    <polygon points="-1,-29 1,-28 1,-23 -1,-24" fill={statusColor} />
                  </g>
                )}

                {category === 'solar' && (
                  <g>
                    <polygon points="-15,0 0,8 15,0 0,-8" fill="#1e293b" />
                    <line x1="0" y1="2" x2="0" y2="-10" stroke="#475569" strokeWidth="2" />
                    {/* Panel */}
                    <polygon points="-20,-5 -5,10 20,-2 5,-17" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
                    <line x1="-12" y1="-8" x2="12" y2="4" stroke="#0ea5e9" strokeWidth="1" />
                    <line x1="-5" y1="-14" x2="20" y2="-2" stroke="#0ea5e9" strokeWidth="1" />
                    <circle cx="0" cy="-3" r="2" fill={statusColor} />
                  </g>
                )}

                {category === 'wind' && (
                  <g>
                    <polygon points="-15,0 0,8 15,0 0,-8" fill="#1e293b" />
                    {/* Tower */}
                    <polygon points="-3,2 3,-1 1,-35 -1,-35" fill="#64748b" />
                    <polygon points="-3,2 0,0 0,-35 -1,-35" fill="#475569" />
                    {/* Nacelle */}
                    <ellipse cx="0" cy="-35" rx="4" ry="2" fill="#94a3b8" />
                    <circle cx="-1" cy="-35" r="1" fill={statusColor} />
                    {/* Blades (Static to prevent distraction) */}
                    <g className="origin-[0px_-35px]">
                      <line x1="0" y1="-35" x2="0" y2="-55" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="0" y1="-35" x2="-17" y2="-25" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="0" y1="-35" x2="17" y2="-25" stroke="#cbd5e1" strokeWidth="1.5" />
                    </g>
                  </g>
                )}

                {category === 'industrial' && (
                  <g>
                    <polygon points="-30,0 0,15 30,0 0,-15" fill="#1e293b" />
                    <polygon points="-22,-4 0,7 22,-4 22,-18 0,-7 -22,-18" fill="#334155" />
                    <polygon points="-22,-4 0,7 0,-7 -22,-18" fill="#1e293b" />
                    {/* Roof Sawtooths */}
                    <polygon points="-22,-18 -11,-12 -11,-22" fill="#475569" />
                    <polygon points="-11,-22 0,-7 0,-17" fill="#64748b" />
                    <polygon points="-11,-12 0,-7 0,-17" fill="#475569" />
                    <polygon points="0,-17 11,-1 11,-11" fill="#64748b" />
                    <polygon points="0,-7 11,-2 11,-12" fill="#475569" />
                    <polygon points="11,-11 22,-6 22,-18" fill="#64748b" />
                    {/* Smoke Stacks */}
                    <rect x="12" y="-30" width="4" height="20" fill="#94a3b8" />
                    <rect x="17" y="-25" width="3" height="15" fill="#64748b" />
                    <circle cx="-5" cy="-2" r="1.5" fill={statusColor} />
                    <circle cx="5" cy="3" r="1.5" fill={statusColor} />
                  </g>
                )}



                {/* Label Pill */}
                <g transform="translate(25, 5)">
                  <rect x="0" y="-12" width={String(label).length * 7 + 10} height="20" fill="#070b10" fillOpacity="0.85" rx="10" border="1" stroke="#2a3441" />
                  <text x="7" y="2" fill="#e7edf3" fontSize="10" className="font-semibold">{label as string}</text>
                </g>
              </g>
            )
          })}
          </svg>
          </div>
        </div>
      </div>
    </main>
  </>
}
