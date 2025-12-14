import React, { useMemo } from 'react'
import { RefreshCw, ChevronDown } from 'lucide-react'
import SortingDropdown from './SortingDropdown'

// Accept either `options` (precomputed lists) or `allData` (array of records)
export default function FiltersBar({ allData = [], options: opts = null, value = {}, onChange, sort, onSortChange, vertical = false }) {
  const options = useMemo(() => {
    if (opts) {
      return {
        regions: opts.customer_region || [],
        genders: opts.gender || [],
        payments: opts.payment_method || [],
        categories: opts.product_category || [],
        tags: opts.tags || []
      }
    }
    const regions = new Set()
    const genders = new Set()
    const payments = new Set()
    const categories = new Set()
    const tags = new Set()
    allData.forEach((r) => {
      if (r['Customer Region'] || r.customer_region) regions.add(r['Customer Region'] || r.customer_region)
      if (r['Gender'] || r.gender) genders.add(r['Gender'] || r.gender)
      if (r['Payment Method'] || r.payment_method) payments.add(r['Payment Method'] || r.payment_method)
      if (r['Product Category'] || r.product_category) categories.add(r['Product Category'] || r.product_category)
      if (r.Tags) {
        const tlist = Array.isArray(r.Tags) ? r.Tags : r.Tags.toString().split(/[,;|]/)
        tlist.forEach((t) => { if (t) tags.add(t.toString().trim()) })
      }
    })
    return {
      regions: Array.from(regions),
      genders: Array.from(genders),
      payments: Array.from(payments),
      categories: Array.from(categories),
      tags: Array.from(tags)
    }
  }, [allData, opts])

  function setFilter(key, val) {
    onChange({ ...value, [key]: val })
  }

  function toggleMulti(key, item) {
    const existing = value[key] || []
    const next = existing.includes(item) ? existing.filter((x) => x !== item) : [...existing, item]
    onChange({ ...value, [key]: next })
  }

  function setRange(key, field, val) {
    const existing = value[key] || {}
    const next = { ...existing, [field]: val }
    onChange({ ...value, [key]: next })
  }

  if (vertical) {
    return (
      <div className="filters-vertical">
        <button className="reset-btn" title="Reset filters" onClick={() => onChange({})}>
          <RefreshCw size={16} />
        </button>

        <div className="filter-vertical-item">
          <label>Customer Region</label>
          <select className="filter-select" onChange={(e) => setFilter('Customer Region', e.target.value ? [e.target.value] : [])} value={(value['Customer Region'] && value['Customer Region'][0]) || ''}>
            <option value="">All</option>
            {options.regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="filter-vertical-item">
          <label>Gender</label>
          <select className="filter-select" onChange={(e) => setFilter('Gender', e.target.value ? [e.target.value] : [])} value={(value['Gender'] && value['Gender'][0]) || ''}>
            <option value="">All</option>
            {options.genders.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="filter-vertical-item">
          <label>Age Range</label>
          <div style={{display:'flex',gap:8}}>
            <input type="number" placeholder="min" value={(value.Age && value.Age.min) || ''} onChange={(e) => setRange('Age','min', e.target.value ? Number(e.target.value) : undefined)} />
            <input type="number" placeholder="max" value={(value.Age && value.Age.max) || ''} onChange={(e) => setRange('Age','max', e.target.value ? Number(e.target.value) : undefined)} />
          </div>
        </div>

        <div className="filter-vertical-item">
          <label>Product Category</label>
          <select className="filter-select" onChange={(e) => setFilter('Product Category', e.target.value ? [e.target.value] : [])} value={(value['Product Category'] && value['Product Category'][0]) || ''}>
            <option value="">All</option>
            {options.categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="filter-vertical-item">
          <label>Tags</label>
          <select className="filter-select" onChange={(e) => setFilter('Tags', e.target.value ? [e.target.value] : [])} value={(value['Tags'] && value['Tags'][0]) || ''}>
            <option value="">All</option>
            {options.tags.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="filter-vertical-item">
          <label>Payment Method</label>
          <select className="filter-select" onChange={(e) => setFilter('Payment Method', e.target.value ? [e.target.value] : [])} value={(value['Payment Method'] && value['Payment Method'][0]) || ''}>
            <option value="">All</option>
            {options.payments.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="filter-vertical-item">
          <label>Date Range</label>
          <div style={{display:'flex',gap:8}}>
            <input type="date" value={(value.Date && value.Date.min) || ''} onChange={(e) => setRange('Date','min', e.target.value || undefined)} />
            <input type="date" value={(value.Date && value.Date.max) || ''} onChange={(e) => setRange('Date','max', e.target.value || undefined)} />
          </div>
        </div>

      </div>
    )
  }

  return (
    <div className="filters-bar">
      <div className="filters-left">
        <button className="reset-btn" title="Reset filters" onClick={() => onChange({})}>
          <RefreshCw size={16} />
        </button>

        <div className="select-wrap">
          <select className="filter-select" onChange={(e) => setFilter('Customer Region', e.target.value ? [e.target.value] : [])} value={(value['Customer Region'] && value['Customer Region'][0]) || ''}>
            <option value="">Customer Region</option>
            {options.regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <ChevronDown size={14} className="select-icon" />
        </div>

        <div className="select-wrap">
          <select className="filter-select" onChange={(e) => setFilter('Gender', e.target.value ? [e.target.value] : [])} value={(value['Gender'] && value['Gender'][0]) || ''}>
            <option value="">Gender</option>
            {options.genders.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <ChevronDown size={14} className="select-icon" />
        </div>

        <div className="select-wrap">
          <select className="filter-select" onChange={(e) => setFilter('Age Range', e.target.value ? [e.target.value] : [])} value={(value['Age Range'] && value['Age Range'][0]) || ''}>
            <option value="">Age Range</option>
            <option value="0-17">0-17</option>
            <option value="18-24">18-24</option>
            <option value="25-34">25-34</option>
            <option value="35-44">35-44</option>
            <option value="45-54">45-54</option>
            <option value="55-64">55-64</option>
            <option value="65+">65+</option>
          </select>
          <ChevronDown size={14} className="select-icon" />
        </div>

        <div className="select-wrap">
          <select className="filter-select" onChange={(e) => setFilter('Product Category', e.target.value ? [e.target.value] : [])} value={(value['Product Category'] && value['Product Category'][0]) || ''}>
            <option value="">Product Category</option>
            {options.categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} className="select-icon" />
        </div>

        <div className="select-wrap">
          <select className="filter-select" onChange={(e) => setFilter('Tags', e.target.value ? [e.target.value] : [])} value={(value['Tags'] && value['Tags'][0]) || ''}>
            <option value="">Tags</option>
            {options.tags.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown size={14} className="select-icon" />
        </div>

        <div className="select-wrap">
          <select className="filter-select" onChange={(e) => setFilter('Payment Method', e.target.value ? [e.target.value] : [])} value={(value['Payment Method'] && value['Payment Method'][0]) || ''}>
            <option value="">Payment Method</option>
            {options.payments.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <ChevronDown size={14} className="select-icon" />
        </div>

        <div className="select-wrap">
          <select className="filter-select" onChange={(e) => setFilter('Date', e.target.value ? [e.target.value] : [])} value={(value['Date'] && value['Date'][0]) || ''}>
            <option value="">Date</option>
            <option value="last_7">Last 7 days</option>
            <option value="last_30">Last 30 days</option>
            <option value="this_month">This month</option>
            <option value="this_year">This year</option>
            <option value="custom">Custom range</option>
          </select>
          <ChevronDown size={14} className="select-icon" />
        </div>
      </div>

      <div className="filters-right">
        <SortingDropdown sort={sort} onChange={onSortChange} />
      </div>
    </div>
  )
}

