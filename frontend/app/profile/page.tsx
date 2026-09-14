'use client'

import { useState } from 'react'
import Topbar from '../components/Topbar'
import { User, Shield, Bell, Settings, LogOut, Key, Smartphone, Globe, Mail, MapPin } from 'lucide-react'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [settings, setSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    criticalOnly: true,
    weatherAnomalies: true,
    darkMode: true,
    metricUnits: true
  })

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return <>
    <main className="main-area">
      <Topbar />

      <div className="content">
        <div className="page-heading">
          <div>
            <div className="breadcrumb">OPERATIONS / <span>USER PROFILE</span></div>
            <h1>Account Settings</h1>
            <p>Manage your operational preferences, security, and alerting rules.</p>
          </div>
        </div>

        <div className="profile-layout">
          {/* Side Tabs */}
          <aside className="profile-sidebar">
            <div className="profile-tabs">
              <button className={`profile-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                <User size={18} /> User Overview
              </button>
              <button className={`profile-tab ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
                <Bell size={18} /> Notification Rules
              </button>
              <button className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                <Shield size={18} /> Security & Access
              </button>
              <button className={`profile-tab ${activeTab === 'preferences' ? 'active' : ''}`} onClick={() => setActiveTab('preferences')}>
                <Settings size={18} /> System Preferences
              </button>
            </div>
          </aside>

          {/* Content Area */}
          <div className="profile-content">
            
            {activeTab === 'overview' && (
              <div className="settings-section animate-fade-in-up">
                <h3>User Overview</h3>
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#202c38]">
                  <div className="profile-avatar-large">PG</div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Pal Ghori</h2>
                    <p className="text-amber-500 font-semibold text-sm tracking-widest uppercase mb-2">Director, Grid Operations</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><MapPin size={14} /> US-West Region</span>
                      <span className="flex items-center gap-1"><Mail size={14} /> pal.ghori@gridguard.ops</span>
                    </div>
                  </div>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Employee ID</h4>
                    <p>GG-OP-9942</p>
                  </div>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Clearance Level</h4>
                    <p>Level 4 (Full Dispatch & System Overrides)</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-section animate-fade-in-up">
                <h3>Notification Rules</h3>
                
                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Critical Asset Failure Alerts</h4>
                    <p>Receive immediate alerts when an asset's failure probability exceeds 75%.</p>
                  </div>
                  <div className={`toggle-switch ${settings.criticalOnly ? 'active' : ''}`} onClick={() => toggleSetting('criticalOnly')}>
                    <div className="toggle-knob" />
                  </div>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Weather Anomaly Warnings</h4>
                    <p>Trigger alerts for extreme weather events (Storms, Heatwaves) in the US-West region.</p>
                  </div>
                  <div className={`toggle-switch ${settings.weatherAnomalies ? 'active' : ''}`} onClick={() => toggleSetting('weatherAnomalies')}>
                    <div className="toggle-knob" />
                  </div>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Email Delivery</h4>
                    <p>Send digest and alerts to pal.ghori@gridguard.ops</p>
                  </div>
                  <div className={`toggle-switch ${settings.emailAlerts ? 'active' : ''}`} onClick={() => toggleSetting('emailAlerts')}>
                    <div className="toggle-knob" />
                  </div>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <h4>SMS Delivery (Emergency)</h4>
                    <p>Send text messages for CRITICAL severity incidents only.</p>
                  </div>
                  <div className={`toggle-switch ${settings.smsAlerts ? 'active' : ''}`} onClick={() => toggleSetting('smsAlerts')}>
                    <div className="toggle-knob" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-section animate-fade-in-up">
                <h3>Security & Access</h3>
                
                <div className="setting-row">
                  <div className="setting-info">
                    <h4 className="flex items-center gap-2"><Smartphone size={16} className="text-amber-500" /> Two-Factor Authentication</h4>
                    <p>Authenticator app is currently configured and required for login.</p>
                  </div>
                  <button className="button">Manage 2FA</button>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <h4 className="flex items-center gap-2"><Key size={16} /> Password</h4>
                    <p>Last changed 42 days ago.</p>
                  </div>
                  <button className="button">Change Password</button>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <h4 className="flex items-center gap-2"><Globe size={16} /> Active Sessions</h4>
                    <p>Mac OS • Chrome • San Francisco, CA (Current Session)<br/>IP: 192.168.1.105</p>
                  </div>
                  <button className="button" style={{ color: 'var(--red)', borderColor: '#4a252a' }}>Terminate All Other Sessions</button>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="settings-section animate-fade-in-up">
                <h3>System Preferences</h3>
                
                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Dark Mode</h4>
                    <p>Use the high-contrast dark theme optimized for control room environments.</p>
                  </div>
                  <div className={`toggle-switch ${settings.darkMode ? 'active' : ''}`} onClick={() => toggleSetting('darkMode')}>
                    <div className="toggle-knob" />
                  </div>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Measurement Units</h4>
                    <p>Use Metric (Celsius, km) instead of Imperial (Fahrenheit, miles).</p>
                  </div>
                  <div className={`toggle-switch ${settings.metricUnits ? 'active' : ''}`} onClick={() => toggleSetting('metricUnits')}>
                    <div className="toggle-knob" />
                  </div>
                </div>

                <div className="setting-row mt-8 pt-6 border-t border-[#202c38]">
                  <button className="button" style={{ color: 'var(--red)', borderColor: '#4a252a' }}>
                    <LogOut size={16} /> Sign Out of Platform
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  </>
}
