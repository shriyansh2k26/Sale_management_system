import React, { useMemo } from 'react'

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="chk">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /> {label}
    </label>
  )
}

export default function FilterPanel({ data = [], value = {}, onChange }) {
  const options = useMemo(() => {
    const regions = new Set()
    const genders = new Set()
    const payment = new Set()
    const tags = new Set()
    const categories = new Set()
    data.forEach((r) => {
      if (r['Customer Region']) regions.add(r['Customer Region'])
      if (r['Gender']) genders.add(r['Gender'])
      if (r['Payment Method']) payment.add(r['Payment Method'])
      if (r['Product Category']) categories.add(r['Product Category'])
      // collect tags
      if (r.Tags) {
        const tlist = Array.isArray(r.Tags) ? r.Tags : r.Tags.toString().split(/[,;|]/)
        tlist.forEach((t) => {
          const s = t && t.toString().trim()
          if (s) tags.add(s)
        })
      }
    })
    return {
      regions: Array.from(regions),
      genders: Array.from(genders),
      payment: Array.from(payment),
      categories: Array.from(categories)
      ,tags: Array.from(tags)
    }
  }, [data])

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

  return (
    <div className="filter-panel">
      <h3>Filters</h3>

      <div>
        <strong>Region</strong>
        {options.regions.map((r) => (
          <Checkbox
            key={r}
            label={r}
            checked={(value['Customer Region'] || []).includes(r)}
            onChange={(on) => toggleMulti('Customer Region', r)}
          />
        ))}
      </div>

      <div>
        <strong>Gender</strong>
        {options.genders.map((g) => (
          <Checkbox
            key={g}
            label={g}
            checked={(value['Gender'] || []).includes(g)}
            onChange={(on) => toggleMulti('Gender', g)}
          />
        ))}
      </div>

      <div>
        <strong>Payment</strong>
        {options.payment.map((p) => (
          <Checkbox
            key={p}
            label={p}
            checked={(value['Payment Method'] || []).includes(p)}
            onChange={(on) => toggleMulti('Payment Method', p)}
          />
        ))}
      </div>

      <div>
        <strong>Category</strong>
        {options.categories.map((c) => (
          <Checkbox
            key={c}
            label={c}
            checked={(value['Product Category'] || []).includes(c)}
            onChange={(on) => toggleMulti('Product Category', c)}
          />
        ))}
      </div>

      <div>
        <strong>Tags</strong>
        {options.tags.map((t) => (
          <Checkbox
            key={t}
            label={t}
            checked={(value['Tags'] || []).includes(t)}
            onChange={(on) => toggleMulti('Tags', t)}
          />
        ))}
      </div>

      <div>
        <strong>Age Range</strong>
        <div>
          <input
            type="number"
            placeholder="min"
            value={(value.Age && value.Age.min) || ''}
            onChange={(e) => setRange('Age', 'min', e.target.value ? Number(e.target.value) : undefined)}
            style={{width:80,marginRight:8}}
          />
          <input
            type="number"
            placeholder="max"
            value={(value.Age && value.Age.max) || ''}
            onChange={(e) => setRange('Age', 'max', e.target.value ? Number(e.target.value) : undefined)}
            style={{width:80}}
          />
        </div>
      </div>

      <div>
        <strong>Date Range</strong>
        <div>
          <input
            type="date"
            value={(value.Date && value.Date.min) || ''}
            onChange={(e) => setRange('Date', 'min', e.target.value || undefined)}
            style={{marginRight:8}}
          />
          <input
            type="date"
            value={(value.Date && value.Date.max) || ''}
            onChange={(e) => setRange('Date', 'max', e.target.value || undefined)}
          />
        </div>
      </div>

      <div>
        <button onClick={() => onChange({})}>Clear Filters</button>
      </div>
    </div>
  )
}
