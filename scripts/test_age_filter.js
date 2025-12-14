const fs = require('fs')
const path = require('path')

const samplePath = path.join(__dirname, '..', 'frontend', 'public', 'sales_sample.json')
const data = JSON.parse(fs.readFileSync(samplePath, 'utf8'))

function matchesRange(age, range) {
  if (age == null || isNaN(Number(age))) return false
  age = Number(age)
  const s = range.toString().trim()
  if (s.endsWith('+')) {
    const min = Number(s.replace('+',''))
    return age >= min
  }
  const m = s.match(/^(\d+)\s*-\s*(\d+)$/)
  if (m) {
    const min = Number(m[1])
    const max = Number(m[2])
    return age >= min && age <= max
  }
  return s === String(age)
}

const ranges = ['0-17','18-24','25-34','35-44','45-54','55-64','65+']

ranges.forEach(r => {
  const matches = data.filter(rec => matchesRange(rec.Age, r))
  console.log(`Range ${r}: ${matches.length} match(es)`)
  matches.forEach(m => console.log(' -', m['Customer Name'] || m['Customer Name']))
})

// show raw ages
console.log('All ages in sample:', data.map(d=>d.Age))
