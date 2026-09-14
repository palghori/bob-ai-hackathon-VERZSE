'use client'

import { useEffect, useState } from 'react'
import { CloudRain, Menu, Bell, Database, Wind, ThermometerSun, AlertTriangle } from 'lucide-react'
import Topbar from '../components/Topbar'

export default function WeatherPage() {
  const [loading, setLoading] = useState(true)
  const [weather, setWeather] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:4000/api/weather/regions`).then(r => r.json())
        setWeather(res.data || [])
      } catch (err) {
        console.error('Error fetching weather', err)
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
            <div className="breadcrumb">OPERATIONS / <span>WEATHER</span></div>
            <h1>Regional Environmental Risk</h1>
            <p>Live ambient conditions affecting grid asset baseline temperatures.</p>
          </div>
        </div>

        <section className="panel mt-6">
          <div className="panel-head">
            <div>
              <div className="eyebrow">REGIONAL OVERVIEW</div>
              <h2>Current Conditions</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {weather.map((w) => {
              const getRiskImpact = () => {
                if (w.severe_weather) return { percent: 80, color: 'text-red-500', label: 'Critical' }
                if (w.wind_speed_kmh > 50) return { percent: 50, color: 'text-amber-500', label: 'High' }
                if (w.rain_mm > 20) return { percent: 30, color: 'text-amber-500', label: 'Elevated' }
                return { percent: 0, color: 'text-green-500', label: 'Normal' }
              }
              const risk = getRiskImpact();
              return (
                <div key={w.region} className="p-5 bg-[#16202b] rounded border border-[#2a3441]">
                  <h3 className="font-bold text-lg border-b border-[#2a3441] pb-3 mb-3">{w.region}</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-slate-400"><ThermometerSun size={15} /> Ambient Temp</span>
                      <strong className="text-lg">{w.temperature_c}°C</strong>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-slate-400"><Wind size={15} /> Wind Speed</span>
                      <strong>{w.wind_speed_kmh} km/h</strong>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-slate-400"><CloudRain size={15} /> Humidity</span>
                      <strong>{w.humidity}%</strong>
                    </div>
                    <div className={`mt-4 pt-3 border-t border-[#2a3441] flex justify-between items-center text-sm font-semibold ${risk.color}`}>
                      <span className="flex items-center gap-2"><AlertTriangle size={15} /> Risk Impact</span>
                      <span>{risk.percent}% ({risk.label})</span>
                    </div>
                  </div>
                </div>
              )
            })}
            {weather.length === 0 && (
              <div className="col-span-3 text-center text-slate-400 py-8">No weather data available.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  </>
}
