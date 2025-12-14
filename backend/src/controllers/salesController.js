const salesService = require('../services/salesService')

// GET /api/sales
// Query params:
//  - q: search string (customer name or phone)
//  - filters: JSON-encoded object of field -> array of allowed values
//  - sortField, sortDir
//  - page (1-based), pageSize

exports.getSales = async (req, res) => {
  try {
    const q = req.query.q || ''
    const filters = req.query.filters ? JSON.parse(req.query.filters) : {}
    const sortField = req.query.sortField || 'date'
    const sortDir = req.query.sortDir || 'desc'
    const page = parseInt(req.query.page || '1', 10)
    const pageSize = parseInt(req.query.pageSize || '10', 10)

    const result = await salesService.querySales({
      search: q,
      filters,
      sort: { field: sortField, dir: sortDir },
      page,
      pageSize
    })

    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

exports.getOptions = async (req, res) => {
  try {
    const opts = await salesService.getOptions()
    res.json(opts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}
