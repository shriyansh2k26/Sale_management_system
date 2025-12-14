const { compareAsc, compareDesc, parseISO } = require('date-fns')

function applyAll(dataset = [], { search = '', filters = {}, sort = { field: 'date', dir: 'desc' }, page = 1, pageSize = 10 }) {
  let items = Array.from(dataset)

  if (search && search.trim()) {
    const q = search.trim().toLowerCase()
    items = items.filter((r) => {
      return (
        (r['Customer Name'] || '').toString().toLowerCase().includes(q) ||
        (r['Phone Number'] || '').toString().toLowerCase().includes(q)
      )
    })
  }

  // Filters: support multi-select arrays, range objects {min,max}, and tags inclusion
  Object.keys(filters || {}).forEach((key) => {
    const val = filters[key]
    if (val === undefined || val === null) return

    // array multi-select
    if (Array.isArray(val)) {
      if (key === 'Tags') {
        // item.Tags may be array or comma/semicolon separated string
        items = items.filter((r) => {
          const tags = Array.isArray(r.Tags) ? r.Tags : (r.Tags || '').toString().split(/[,;|]/).map(s=>s.trim()).filter(Boolean)
          return val.some(v => tags.includes(v))
        })
      } else {
        items = items.filter((r) => val.includes(r[key]))
      }
      return
    }

    // range filter (object with min/max)
    if (typeof val === 'object' && (val.min !== undefined || val.max !== undefined)) {
      items = items.filter((r) => {
        const v = r[key]
        if (v === undefined || v === null || v === '') return false
        // numeric range
        if (!isNaN(Number(v))) {
          const num = Number(v)
          if (val.min !== undefined && num < Number(val.min)) return false
          if (val.max !== undefined && num > Number(val.max)) return false
          return true
        }
        // date range
        if (key.toLowerCase().includes('date')) {
          try {
            const d = parseISO(r.Date)
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

    // single-value equality
    items = items.filter((r) => {
      return (r[key] === val)
    })
  })

  const { field, dir } = sort || { field: 'date', dir: 'desc' }
  items.sort((a, b) => {
    let A = a[field]
    let B = b[field]

    if (field === 'date' || field === 'Date') {
      try {
        const ad = parseISO(a.Date)
        const bd = parseISO(b.Date)
        return dir === 'asc' ? compareAsc(ad, bd) : compareDesc(ad, bd)
      } catch (e) {
        return 0
      }
    }

    if (A === undefined && field === 'Customer Name') A = a['Customer Name']
    if (B === undefined && field === 'Customer Name') B = b['Customer Name']

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

module.exports = { applyAll }
