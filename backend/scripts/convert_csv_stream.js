const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse')

if (process.argv.length < 3) {
  console.error('Usage: node scripts/convert_csv_stream.js <input.csv> [output.json]')
  process.exit(1)
}

const input = process.argv[2]
const output = process.argv[3] || path.join(__dirname, '..', 'data', 'sales.json')

const reader = fs.createReadStream(input)
const writer = fs.createWriteStream(output, { encoding: 'utf8' })

writer.write('[\n')
let first = true

const parser = parse({ columns: true, relax_quotes: true, trim: true })

parser.on('readable', () => {
  let record
  while ((record = parser.read())) {
    // normalize
    const out = {}
    Object.keys(record).forEach((k) => {
      const v = record[k]
      const trimmed = v === undefined || v === null ? '' : v.toString().trim()
      if (k.toLowerCase() === 'tags') {
        out['Tags'] = trimmed ? (trimmed.includes(',') || trimmed.includes(';') ? trimmed.split(/[,;|]/).map(s=>s.trim()).filter(Boolean) : [trimmed]) : []
      } else if (trimmed !== '' && !isNaN(Number(trimmed))) {
        out[k] = Number(trimmed)
      } else {
        out[k] = trimmed
      }
    })

    const json = JSON.stringify(out)
    if (!first) writer.write(',\n')
    writer.write(json)
    first = false
  }
})

parser.on('end', () => {
  writer.write('\n]\n')
  writer.end()
  console.log('Wrote', output)
})

parser.on('error', (err) => {
  console.error('Parse error', err)
  process.exit(1)
})

reader.pipe(parser)
