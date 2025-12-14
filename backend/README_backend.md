Backend setup and import instructions

1) Create a MongoDB Atlas free-tier cluster and obtain `MONGO_URI`.

2) Place the provided CSV `truestate_assignment_dataset.csv` in the repository root (do not import CSV into codebase as static data).

3) Install dependencies (from `backend/`):

```bash
cd backend
npm install express mongoose cors dotenv csv-parser
```

4) Import CSV into MongoDB (example):

```bash
# set MONGO_URI and CSV_PATH in environment or use .env file
node scripts/import_to_mongodb.js
```

5) Start server:

```bash
node server.js
```

API endpoints
- `GET /api/sales` - query params: `page`, `pageSize`, `search`, `sortBy`, `sortOrder`, `filters` (JSON string)

Notes:
- Filters JSON should use the keys: `customerRegion`, `gender`, `ageMin`, `ageMax`, `productCategory`, `tags`, `paymentMethod`, `dateFrom`, `dateTo`.
- Example filters: `{"tags":["Electronics"],"customerRegion":["West"]}`
