const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/truestate';

async function main() {
  await mongoose.connect(MONGO_URI);

  const saleSchema = new mongoose.Schema({}, { strict: false, collection: 'sales' });
  const Sale = mongoose.model('Sale', saleSchema);

  // Ensure text index for search across customer name and phone number
  try {
    await Sale.collection.createIndex({ customer_name: 'text', phone_number: 'text' });
  } catch (e) {
    // index may already exist
  }

  // Build Mongo filter from request filters
  function buildQuery(filters = {}) {
    const q = {};

    if (filters.customerRegion && filters.customerRegion.length) q.customer_region = { $in: filters.customerRegion };
    if (filters.gender && filters.gender.length) q.gender = { $in: filters.gender };
    if (filters.productCategory && filters.productCategory.length) q.product_category = { $in: filters.productCategory };
    if (filters.paymentMethod && filters.paymentMethod.length) q.payment_method = { $in: filters.paymentMethod };
    if (filters.tags && filters.tags.length) q.tags = { $in: filters.tags };

    if (filters.ageMin != null || filters.ageMax != null) {
      q.age = {};
      if (filters.ageMin != null) q.age.$gte = Number(filters.ageMin);
      if (filters.ageMax != null) q.age.$lte = Number(filters.ageMax);
      if (Object.keys(q.age).length === 0) delete q.age;
    }

    if (filters.dateFrom || filters.dateTo) {
      q.date = {};
      if (filters.dateFrom) q.date.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) q.date.$lte = new Date(filters.dateTo);
      if (Object.keys(q.date).length === 0) delete q.date;
    }

    return q;
  }

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  // Main query endpoint supporting search, filters, sort, pagination
  app.get('/api/sales', async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const pageSize = Math.max(1, parseInt(req.query.pageSize || '10', 10));
      const search = req.query.search ? String(req.query.search).trim() : null;
      const sortBy = req.query.sortBy || 'date';
      const sortOrder = (req.query.sortOrder || 'desc').toLowerCase() === 'asc' ? 1 : -1;

      let filters = {};
      if (req.query.filters) {
        try { filters = JSON.parse(req.query.filters); } catch (e) { filters = {}; }
      }

      const mongoQuery = buildQuery(filters);

      let cursor;

      if (search) {
        // use text search
        cursor = Sale.find({ $text: { $search: search }, ...mongoQuery }, { score: { $meta: 'textScore' } });
      } else {
        cursor = Sale.find(mongoQuery);
      }

      // Sorting
      const sortMap = {
        date: { date: sortOrder },
        quantity: { quantity: sortOrder },
        customer_name: { customer_name: sortOrder }
      };

      if (search) {
        // if text search, default sort by score then requested
        cursor = cursor.sort({ score: { $meta: 'textScore' }, ...(sortMap[sortBy] || { date: sortOrder }) });
      } else {
        cursor = cursor.sort(sortMap[sortBy] || { date: sortOrder });
      }

      const total = await Sale.countDocuments(search ? { $text: { $search: search }, ...mongoQuery } : mongoQuery);

      const results = await cursor.skip((page - 1) * pageSize).limit(pageSize).lean().exec();

      res.json({ page, pageSize, total, totalPages: Math.ceil(total / pageSize), results });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Return distinct option lists for filters
  app.get('/api/sales/options', async (req, res) => {
    try {
      const regions = await Sale.distinct('customer_region')
      const genders = await Sale.distinct('gender')
      const payments = await Sale.distinct('payment_method')
      const categories = await Sale.distinct('product_category')

      // tags: unwind and distinct
      let tags = []
      try {
        const agg = await Sale.aggregate([
          { $project: { tags: 1 } },
          { $unwind: { path: '$tags', preserveNullAndEmptyArrays: false } },
          { $group: { _id: null, tags: { $addToSet: '$tags' } } },
          { $project: { _id: 0, tags: 1 } }
        ])
        tags = (agg[0] && agg[0].tags) || []
      } catch (e) {
        tags = []
      }

      res.json({ customer_region: regions.filter(Boolean), gender: genders.filter(Boolean), payment_method: payments.filter(Boolean), product_category: categories.filter(Boolean), tags })
    } catch (err) {
      console.error('options error', err)
      res.status(500).json({ error: 'Server error' })
    }
  })

  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Backend server listening on port ${port}`));
}

main().catch(err => {
  console.error('Failed to start server', err);
  process.exit(1);
});

module.exports = app;
