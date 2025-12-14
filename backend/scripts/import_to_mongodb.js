const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/truestate';
const CSV_PATH = process.env.CSV_PATH || path.resolve(__dirname, '../../truestate_assignment_dataset.csv');

async function connect() {
  await mongoose.connect(MONGO_URI);
}

function normalizeRow(row) {
  const r = Object.assign({}, row);

  // try to parse numeric fields
  ['Quantity', 'Quantity ', 'quantity', 'quantity '].forEach(k => {
    if (r[k]) r.quantity = Number(r[k]);
  });

  if (r['Price per Unit']) r.price_per_unit = Number(r['Price per Unit']);
  if (r['Discount Percentage']) r.discount_percentage = Number(r['Discount Percentage']);
  if (r['Total Amount']) r.total_amount = Number(r['Total Amount']);
  if (r['Final Amount']) r.final_amount = Number(r['Final Amount']);

  // normalize tags (comma or pipe separated)
  const tagsKey = Object.keys(r).find(k => /tag/i.test(k)) || 'Tags';
  if (r[tagsKey]) r.tags = String(r[tagsKey]).split(/[|,;]/).map(s => s.trim()).filter(Boolean);

  // parse date
  const dateKey = Object.keys(r).find(k => /date/i.test(k)) || 'Date';
  if (r[dateKey]) {
    const d = new Date(r[dateKey]);
    if (!isNaN(d.getTime())) r.date = d;
  }

  // lower-case field names for easier querying
  Object.keys(r).forEach(k => {
    const lk = k.toLowerCase().replace(/ /g, '_');
    if (lk !== k) {
      r[lk] = r[k];
      delete r[k];
    }
  });

  return r;
}

async function importCsv() {
  await connect();

  const Sale = mongoose.model('Sale', new mongoose.Schema({}, { strict: false, collection: 'sales' }));

  const stream = fs.createReadStream(CSV_PATH).pipe(csv());

  const batch = [];
  const BATCH_SIZE = 1000;
  let inserted = 0;

  for await (const row of stream) {
    const doc = normalizeRow(row);
    batch.push(doc);

    if (batch.length >= BATCH_SIZE) {
      await Sale.collection.insertMany(batch, { ordered: false }).catch(() => {});
      inserted += batch.length;
      console.log('Inserted', inserted);
      batch.length = 0;
    }
  }

  if (batch.length) {
    await Sale.collection.insertMany(batch, { ordered: false }).catch(() => {});
    inserted += batch.length;
    console.log('Inserted', inserted);
  }

  console.log('Import finished. Total inserted ~', inserted);
  process.exit(0);
}

importCsv().catch(err => {
  console.error(err);
  process.exit(1);
});
