import React, { useMemo, useState } from 'react'
import { Copy, Check } from 'lucide-react'

function PhoneWithCopy({ phone }) {
  const [copied, setCopied] = useState(false)
  async function doCopy() {
    try {
      await navigator.clipboard.writeText(phone || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch (e) {
      // ignore
    }
  }
  return (
    <div className="phone-copy">
      <span className="phone">{phone}</span>
      <button className="copy-btn" title="Copy" onClick={doCopy} aria-label="Copy phone">
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  )
}

function formatCell(value, key) {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch (e) {
      return String(value)
    }
  }
  return value
}

export default function TransactionTable({ items = [], loading }) {
  if (loading) return <div className="loading">Loading...</div>
  if (!items || items.length === 0) return <div className="no-results">No results</div>

    const columns = useMemo(() => {
      // Preferred column order and display labels
      const desired = [
        { label: 'Transaction ID', keys: ['Transaction ID', 'TransactionID', 'transactionId', 'transaction_id', 'Transaction_Id'] },
        { label: 'Date', keys: ['Date', 'date'] },
        { label: 'Customer ID', keys: ['Customer ID', 'CustomerID', 'customerId', 'customer_id'] },
        { label: 'Customer name', keys: ['Customer Name', 'CustomerName', 'customerName', 'customer_name'] },
        { label: 'Phone Number', keys: ['Phone Number', 'Phone', 'phone', 'phoneNumber', 'PhoneNumber'] },
        { label: 'Gender', keys: ['Gender', 'gender'] },
        { label: 'Age', keys: ['Age', 'age'] },
        { label: 'Product Category', keys: ['Product Category', 'ProductCategory', 'productCategory', 'product_category'] },
        { label: 'Quantity', keys: ['Quantity', 'quantity', 'Qty', 'qty'] },
        { label: 'Total Amount', keys: ['Total Amount', 'TotalAmount', 'total_amount', 'amount', 'Amount'] },
        { label: 'Customer region', keys: ['Customer region', 'Customer Region', 'customer_region', 'region'] },
        { label: 'Product ID', keys: ['Product ID', 'ProductID', 'productId', 'product_id'] },
        { label: 'Employee name', keys: ['Employee name', 'Employee Name', 'employeeName', 'employee_name'] },
      ]

      // Helper: find matching key in an item for a list of candidate names
      const findInItem = (item, candidates) => {
        if (!item) return undefined
        for (const c of candidates) {
          if (Object.prototype.hasOwnProperty.call(item, c)) return c
          // also try lowercase matching
          const lowerKey = Object.keys(item).find((k) => k.toLowerCase() === c.toLowerCase())
          if (lowerKey) return lowerKey
        }
        return undefined
      }

      const first = items[0] || {}
      const cols = desired.map((d) => {
        const key = findInItem(first, d.keys) || d.keys[0]
        return { key, label: d.label }
      })

      // Return only the desired columns (in requested order). Do not append extras.
      return cols
  }, [items])

  return (
    <div className="table-card">
      <table className="transactions">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((r, idx) => (
            <tr key={(r['Transaction ID'] || r['Customer ID'] || idx) + '-' + idx}>
              {columns.map((col) => {
                const key = col.key
                const val = r[key]
                if ((key || '').toLowerCase().includes('phone') || (col.label || '').toLowerCase().includes('phone')) {
                  return (
                    <td key={key}><PhoneWithCopy phone={val} /></td>
                  )
                }
                const isQty = /quantity|qty/i.test(key) || /quantity|qty|amount|total/i.test(col.label)
                return (
                  <td key={key} className={isQty ? 'qty-col' : ''}>
                    {formatCell(val, key)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
