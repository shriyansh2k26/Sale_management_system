import { compareAsc, compareDesc, parseISO } from 'date-fns'

function getValue(rec = {}, key) {
  if (!rec || key == null) return undefined
  // try the exact key first
  if (rec[key] !== undefined) return rec[key]
  const lower = key.toLowerCase()
  if (rec[lower] !== undefined) return rec[lower]
  const underscored = key.replace(/ /g, '_')
  if (rec[underscored] !== undefined) return rec[underscored]
  const lowerUnderscored = underscored.toLowerCase()
  if (rec[lowerUnderscored] !== undefined) return rec[lowerUnderscored]
  const nospace = key.replace(/ /g, '')
  if (rec[nospace] !== undefined) return rec[nospace]
  const lowerNospace = nospace.toLowerCase()
  if (rec[lowerNospace] !== undefined) return rec[lowerNospace]
  // try common JSON styles: snake_case keys in original case
  // finally, return undefined
  return undefined
}

export function applyAll(dataset = [], { search = '', filters = {}, sort = { field: 'date', dir: 'desc' }, page = 1, pageSize = 10 }) {
  let items = Array.from(dataset)

  if (search && search.trim()) {
    const q = search.trim().toLowerCase()
    const fieldsToSearch = [
      'Customer Name', 'CustomerName', 'customerName', 'customer_name', 'Name', 'Customer',
      'Phone Number', 'PhoneNumber', 'phone', 'phone_number'
    ]
    items = items.filter((r) => {
      const hit = fieldsToSearch.some((k) => {
        const v = getValue(r, k)
        return (v || '').toString().toLowerCase().includes(q)
      })
      if (hit) return true
      // fallback: search across all string or array values in the record
      return Object.values(r).some((val) => {
        if (val == null) return false
        if (Array.isArray(val)) return val.some((x) => (x || '').toString().toLowerCase().includes(q))
        return (val || '').toString().toLowerCase().includes(q)
      })
    })
  }

  // Filters: support multi-select arrays, ranges (object {min,max}), and tags inclusion
  Object.keys(filters || {}).forEach((key) => {
    const val = filters[key]
    if (val === undefined || val === null) return

    if (Array.isArray(val)) {
      if (key === 'Tags') {
        items = items.filter((r) => {
          const raw = getValue(r, 'Tags')
          const tags = Array.isArray(raw) ? raw : (raw || '').toString().split(/[,;|]/).map(s=>s.trim()).filter(Boolean)
          return val.some(v => tags.includes(v))
        })
      } else if (key === 'Age Range' || key.toLowerCase().includes('age range')) {
        items = items.filter((r) => {
          const ageRaw = getValue(r, 'Age') || getValue(r, 'age')
          const age = Number(ageRaw)
          if (isNaN(age)) return false
          return val.some((range) => {
            if (!range) return false
            const s = range.toString().trim()
            if (s.endsWith('+')) {
              const min = Number(s.replace('+', ''))
              return age >= min
            }
            const m = s.match(/^(\d+)\s*-\s*(\d+)$/)
            if (m) {
              const min = Number(m[1])
              const max = Number(m[2])
              return age >= min && age <= max
            }
            // fallback: exact match
            return s === String(age)
          })
        })
      } else {
        items = items.filter((r) => {
          const v = getValue(r, key)
          return val.includes(v)
        })
      }
      return
    }

    // Support string values for single-selects (e.g. '25-34')
    if (typeof val === 'string' && (key === 'Age Range' || key.toLowerCase().includes('age range'))) {
      const range = val && val.toString().trim()
      if (!range) return
      items = items.filter((r) => {
        const ageRaw = getValue(r, 'Age') || getValue(r, 'age')
        const age = Number(ageRaw)
        if (isNaN(age)) return false
        const s = range
        if (s.endsWith('+')) {
          const min = Number(s.replace('+', ''))
          return age >= min
        }
        const m = s.match(/^(\d+)\s*-\s*(\d+)$/)
        if (m) {
          const min = Number(m[1])
          const max = Number(m[2])
          return age >= min && age <= max
        }
        return s === String(age)
      })
      return
    }

    if (typeof val === 'object' && (val.min !== undefined || val.max !== undefined)) {
      items = items.filter((r) => {
        const v = getValue(r, key)
        if (v === undefined || v === null || v === '') return false
        if (!isNaN(Number(v))) {
          const num = Number(v)
          if (val.min !== undefined && num < Number(val.min)) return false
          if (val.max !== undefined && num > Number(val.max)) return false
          return true
        }
        if (key.toLowerCase().includes('date')) {
          try {
            const dateRaw = getValue(r, 'Date') || getValue(r, key)
            const d = parseISO(dateRaw)
            if (val.min) {
              const minD = parseISO(val.min)
              if (compareAsc(d, minD) < 0) return false
            }
            if (val.max) {
              const maxD = parseISO(val.max)
              if (compareAsc(d, maxD) > 0) return false
            }
            return true
          } catch (e) {
            return false
          }
        }
        return false
      })
      return
    }

    items = items.filter((r) => getValue(r, key) === val)
  })

  const { field, dir } = sort || { field: 'date', dir: 'desc' }
  items.sort((a, b) => {
    const A = getValue(a, field) ?? getValue(a, field === 'date' ? 'Date' : field)
    const B = getValue(b, field) ?? getValue(b, field === 'date' ? 'Date' : field)

    if (field === 'date' || field === 'Date') {
      try {
        const ad = parseISO(getValue(a, 'Date'))
        const bd = parseISO(getValue(b, 'Date'))
        return dir === 'asc' ? compareAsc(ad, bd) : compareDesc(ad, bd)
      } catch (e) {
        return 0
      }
    }

    if (!isNaN(Number(A)) && !isNaN(Number(B))) {
      return dir === 'asc' ? Number(A) - Number(B) : Number(B) - Number(A)
    }

    const sa = (A || '').toString().toLowerCase()
    const sb = (B || '').toString().toLowerCase()
    if (sa < sb) return dir === 'asc' ? -1 : 1
    if (sa > sb) return dir === 'asc' ? 1 : -1
    return 0
  })

  const total = items.length
  const start = (page - 1) * pageSize
  const paged = items.slice(start, start + pageSize)

  return { items: paged, total }
}
