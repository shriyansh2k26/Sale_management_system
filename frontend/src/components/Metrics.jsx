import React from 'react'

function Card({ title, value, hint }) {
  return (
    <div className="metric-card">
      <div className="metric-title">{title}</div>
      <div className="metric-value">{value}</div>
      {hint && <div className="metric-hint">{hint}</div>}
    </div>
  )
}

export default function Metrics({ data = [] }) {
  const totalUnits = data.reduce((s, r) => s + (Number(r.Quantity) || 0), 0)
  const totalAmount = data.reduce((s, r) => s + (Number(r['Final Amount']) || 0), 0)
  const totalDiscount = data.reduce((s, r) => {
    const ta = Number(r['Total Amount']) || 0
    const fa = Number(r['Final Amount']) || 0
    return s + (ta - fa)
  }, 0)

  return (
    <div className="metrics-row">
      <Card title="Total units sold" value={<><span className="metric-value-large">{totalUnits}</span></>} hint={null} />
      <Card title="Total Amount" value={<><span className="metric-value-large">{`₹${totalAmount.toLocaleString()}`}</span></>} hint={`(${data.length} SRs)`} />
      <Card title="Total Discount" value={<><span className="metric-value-large">{`₹${totalDiscount.toLocaleString()}`}</span></>} hint={`(calculated)`} />
    </div>
  )
}
