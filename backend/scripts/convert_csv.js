const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')

if (process.argv.length < 3) {
  console.error('Usage: node scripts/convert_csv.js <input.csv> [output.json]')
  process.exit(1)
}

const input = process.argv[2]
const output = process.argv[3] || path.join(__dirname, '..', 'data', 'sales.json')

const csv = fs.readFileSync(input, 'utf8')
const records = parse(csv, {
  columns: true,
  skip_empty_lines: true
})

// Normalize records: parse numeric fields and tags/date
const normalized = records.map((r) => {
  const out = { }
  Object.keys(r).forEach((k) => {
    const v = r[k]
    // try numeric
    if (v === undefined || v === null) {
      out[k] = v
      return
    }
    const trimmed = v.toString().trim()
    if (trimmed === '') { out[k] = '' ; return }

    // detect arrays in Tags field (comma/semicolon separated)
    if (k.toLowerCase() === 'tags') {
      out['Tags'] = trimmed.includes(';') || trimmed.includes(',') ? trimmed.split(/[,;|]/).map(s=>s.trim()).filter(Boolean) : [trimmed]
      return
    }

    // numeric fields
    if (!isNaN(Number(trimmed))) {
      out[k] = Number(trimmed)
      return
    }

    // keep date as-is (assume ISO or YYYY-MM-DD)
    out[k] = trimmed
  })
  return out
})

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, JSON.stringify(normalized, null, 2), 'utf8')
console.log('Wrote', output, 'with', normalized.length, 'records')
