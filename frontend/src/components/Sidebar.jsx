import React, { useState } from 'react'
import { Home, Users, Play, Folder, Clipboard, FileText, ChevronDown, Circle } from 'lucide-react'

function NavItem({ icon: Icon, label, className }) {
  return (
    <div className={`nav-item ${className || ''}`}>
      <Icon size={18} className="nav-icon" />
      <div className="nav-label">{label}</div>
    </div>
  )
}

function ExpandCard({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card">
      <div className="card-header" onClick={() => setOpen((s) => !s)}>
        <div className="card-title">{title}</div>
        <ChevronDown size={16} className={`card-chevron ${open ? 'open' : ''}`} />
      </div>
      {open && <div className="card-body">{children}</div>}
    </div>
  )
}

export default function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div className="brand-card">
        <div className="brand-left">
          <div className="avatar"> 
            <div className="avatar-icon">V</div>
          </div>
          <div>
            <div className="brand-title">Vault</div>
            <div className="brand-sub">Anurag Yadav</div>
          </div>
        </div>
        <div className="brand-chevron"><ChevronDown size={16} /></div>
      </div>

      <nav className="nav">
        <NavItem icon={Home} label="Dashboard" />
        <NavItem icon={Users} label="Nexus" />
        <NavItem icon={Play} label="Intake" />

        <ExpandCard title={<><Clipboard size={16} className="card-icon"/> Services</>} defaultOpen={true}>
          <div className="card-item"><Play size={14} className="item-icon"/> <span>Pre-active</span></div>
          <div className="card-item"><Folder size={14} className="item-icon"/> <span>Active</span></div>
          <div className="card-item"><Circle size={14} className="item-icon muted-icon"/> <span>Blocked</span></div>
          <div className="card-item"><Circle size={14} className="item-icon muted-icon"/> <span>Closed</span></div>
        </ExpandCard>

        <ExpandCard title={<><FileText size={16} className="card-icon"/> Invoices</>} defaultOpen={true}>
          <div className="card-item selected"><FileText size={14} className="item-icon"/> <span className="strong">Proforma Invoices</span></div>
          <div className="card-item"><FileText size={14} className="item-icon"/> <span>Final Invoices</span></div>
        </ExpandCard>
      </nav>
    </aside>
  )
}
