const mongoose = require('mongoose')

// Sale model (flexible schema) using existing 'sales' collection
const Sale = mongoose.models.Sale || mongoose.model('Sale', new mongoose.Schema({}, { strict: false, collection: 'sales' }))

function toMongoField(frontKey) {
  // Convert frontend keys like 'Customer Name' or 'Quantity' to mongo field names used during import
  if (!frontKey) return frontKey
  return frontKey.toString().toLowerCase().replace(/ /g, '_')
}

function toFrontendDoc(doc) {
  // Convert mongo doc fields (snake_case) back to frontend-friendly keys (Title Case with spaces)
  const out = {}
  Object.keys(doc).forEach((k) => {
    if (k === '_id') { out._id = doc._id; return }
    const parts = k.split('_').map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    const title = parts.join(' ')
    out[title] = doc[k]
  })
  return out
}

async function querySales({ search = '', filters = {}, sort = { field: 'date', dir: 'desc' }, page = 1, pageSize = 10 }) {
  const q = {}

  // Search across common fields
  if (search && search.trim()) {
    const re = new RegExp(search.trim(), 'i')
    q.$or = [ { customer_name: re }, { phone_number: re }, { customer_name: { $regex: re } } ]
  }

  // Filters: frontend sends keys like 'Customer Region', 'Tags', etc.
  Object.keys(filters || {}).forEach((fk) => {
    const val = filters[fk]
    if (val === undefined || val === null) return
    const mk = toMongoField(fk)

    // array multi-select
    if (Array.isArray(val) && val.length > 0) {
      if (mk === 'tags') {
        q[mk] = { $in: val }
      } else {
        q[mk] = { $in: val }
      }
      return
    }

    // range object
    if (typeof val === 'object' && (val.min !== undefined || val.max !== undefined)) {
      const range = {}
      if (val.min !== undefined) range.$gte = val.min
      if (val.max !== undefined) range.$lte = val.max
      q[mk] = range
      return
    }

    // single equality
    q[mk] = val
  })

  const mongoSort = {}
  const sortField = sort && sort.field ? toMongoField(sort.field) : 'date'
  const dir = sort && sort.dir === 'asc' ? 1 : -1
  mongoSort[sortField] = dir

  const total = await Sale.countDocuments(q)
  const items = await Sale.find(q).sort(mongoSort).skip((page - 1) * pageSize).limit(pageSize).lean()

  // Convert docs back to frontend shape
  const mapped = items.map(toFrontendDoc)

  return { items: mapped, total }
}

module.exports = { querySales }

async function getOptions() {
  // return distinct values for filterable fields
  const fields = ['customer_region', 'gender', 'payment_method', 'product_category']
  const out = {}
  for (const f of fields) {
    out[f] = await Sale.distinct(f).then(arr => arr.filter(v => v !== undefined && v !== null && v !== ''))
  }

  // tags: unwind and distinct
  try {
    const tags = await Sale.aggregate([
      { $project: { tags: 1 } },
      { $unwind: { path: '$tags', preserveNullAndEmptyArrays: false } },
      { $group: { _id: null, tags: { $addToSet: '$tags' } } },
      { $project: { _id: 0, tags: 1 } }
    ])
    out.tags = (tags[0] && tags[0].tags) || []
  } catch (e) {
    out.tags = []
  }

  return out
}

module.exports = { querySales, getOptions }
