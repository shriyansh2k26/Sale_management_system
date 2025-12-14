import axios from 'axios'

// Use Vite/browser env vars (import.meta.env). Provide a safe default.
const BACKEND_URL = (import.meta && import.meta.env && (import.meta.env.VITE_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL)) || 'http://localhost:4000'

export async function fetchSales(params = {}) {
  try {
    // prefer backend API; fallback to static sample if backend unavailable
    const apiUrl = `http://localhost:4000/api/sales`
    const res = await axios.get(apiUrl, { params })
    const d = res.data
    // Normalize backend shape: server returns { results, total, page, pageSize }
    if (Array.isArray(d)) return d
    if (d && (d.results || d.items)) {
      return {
        items: d.results || d.items || [],
        total: d.total != null ? d.total : (d.results ? d.results.length : (d.items ? d.items.length : 0)),
        page: d.page,
        pageSize: d.pageSize,
        totalPages: d.totalPages
      }
    }
    return d
  } catch (err) {
    console.warn('fetchSales backend failed, falling back to sample', err.message)
    try {
      const res2 = await axios.get('/sales_sample.json')
      return res2.data
    } catch (err2) {
      console.error('fetchSales error', err2)
      return []
    }
  }
}

export async function fetchSalesOptions() {
  try {
    const apiUrl = `http://localhost:4000/api/sales/options`
    const res = await axios.get(apiUrl)
    return res.data
  } catch (err) {
    console.warn('fetchSalesOptions failed', err.message)
    return { customer_region: [], gender: [], payment_method: [], product_category: [], tags: [] }
  }
}
