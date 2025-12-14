const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/truestate';

async function run() {
  await mongoose.connect(MONGO_URI);
  const Sale = mongoose.model('Sale', new mongoose.Schema({}, { strict: false, collection: 'sales' }));

  const count = await Sale.countDocuments();
  console.log('COUNT:', count);

  const sample = await Sale.findOne().lean();
  if (sample) {
    // Print only a subset of fields to keep output readable
    const keys = Object.keys(sample).slice(0, 30);
    const small = {};
    keys.forEach(k => { small[k] = sample[k]; });
    console.log('SAMPLE:', JSON.stringify(small, null, 2));
  } else {
    console.log('No documents found in sales collection.');
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
